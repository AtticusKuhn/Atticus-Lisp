import fs from "fs"
import nearley from "nearley"
// import lexer from "./lexer";
// import fs from "fs"
const grammar = require("../grammar.js")
// Create a Parser object from our grammar.

type tokenData = {
    "text": string,
    "offset": number,
    "lineBreaks": number,
    "line": number,
    "col": number
}
const dummyData: tokenData = {
    "text": "",
    col: 0,
    line: 0,
    lineBreaks: 0,
    offset: 0
}
type AST = sExpression[];
type sExpression = {
    type: "sExpression",
    values: value[]
}
type value = sExpression
    | number_literal
    | string_literal
    | identifier
type number_literal = {
    "type": "number_literal",
    "value": number,
} & tokenData;
type string_literal = {
    "type": "string_literal",
    value: string,
} & tokenData;
type identifier = {
    "type": "identifier",
    "value": string,
} & tokenData;
type program = {
    names: Map<string, func>,
}
type func = {
    arguments: { name: string }[],
    body: value,
}
function parse(code: string): AST {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(code);
    if (parser.results.length > 1) {
        for (let i = 0; i < parser.results.length; i++) {
            console.log("ambiguous parser")
        }
        throw new Error("ambiguous parser")
    }
    if (parser.results.length === 0) {
        throw new Error(`no parse found for code "${code}"`)
    }
    return parser.results[0]
}
const ASTtoProgram = (ast: AST): program => {
    const map = new Map<string, func>();
    ast.forEach((sExp) => {
        const first = sExp.values[0];
        if (first.type === "identifier") {
            const func: func = {
                arguments: sExp.values.slice(1, sExp.values.length - 1).map((val) => {
                    if (val.type === "sExpression") {
                        throw new Error(`function argument cannot be s expression`)
                    } else {
                        return {
                            name: val.text
                        }
                    }
                }),
                body: sExp.values[sExp.values.length - 1]
            }
            map.set(first.value, func)
        } else {
            throw new Error(`first element of sExpression must be identifier, got ${first.type}`)
        }
    })
    return {
        names: map
    }
}
//@ts-ignore
const makeIdentifier = (name: string): identifier => ({
    type: "identifier",
    value: name,
    ...dummyData
})
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func: Function): string[] {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
const evaluate = (exprToCall: sExpression, prog: program): any => {
    console.log(`calling ${JSON.stringify(exprToCall, null, 4)}`)
    const first = exprToCall.values[0];
    if (first.type === "string_literal" || first.type === "number_literal") return first.value
    const args = exprToCall.values.slice(1);
    if (first.type !== "identifier") throw new Error(`cannot call a non-identifier. I tried to call a ${first.type}. Debug info: ${JSON.stringify(first, null, 2)}`)
    const funcName = first.value
    if (funcName === "compile") {
        // const compilerInstructions = evaluate(parse(`(compile ${funcName})`)[0], newProg)
        // console.log("compilerInstructions", compilerInstructions)
        // if (compilerInstructions) {
        const jsfunc = eval(evaluate(wrapWithS(args[0]), prog))
        const params = getParamNames(jsfunc);

        console.log("evaluating js func")
        //@ts-ignore
        return jsfunc(...(params.map((p) => prog.names.get(p), prog)))
        // }
    }
    const func = prog.names.get(funcName);
    const argumentsContext: Map<string, func> = new Map() // name to value
    if (func) {
        console.log(`${funcName} has ${func.arguments.length} arugments`)
        console.log(prog.names)
        for (let i = 0; i < func.arguments.length; i++) {
            console.log(`setting ${func.arguments[i].name}`)
            //@ts-ignore
            argumentsContext.set(func.arguments[i].name, (args[i]))
        }
    } else {
        console.log("func doesn't exist for ", funcName)
    }
    for (const arg of args) {
        if (arg.type === "identifier") {
            const argval = prog.names.get(arg.value)
            if (!argval) throw new Error(`cannot find value for the function argument "${arg.value}"`)
            argumentsContext.set(arg.value, {
                arguments: [],
                //@ts-ignore
                body: argval,//{ type: "number_literal", value: 1 }///evaluate(wrapWithS(arg), prog)
            });
        } else {

            // throw new Error(`arg must be identifier, it was actually of type ${arg.type}. Arg =  ${JSON.stringify(arg, null, 2)}`)
        }
    }
    console.log("argumentsContext is", argumentsContext)
    const newContext = new Map([...argumentsContext, ...prog.names])
    const newProg: program = { names: newContext }
    console.log("func is", funcName)
    if (!func) {
        console.log(`cannot find func "${funcName}" in`, newProg.names)

        throw new Error(`cannot find func. Tried to call a function called "${funcName}", but does not exist in this context`)
    }
    console.log("evaluated body of func")
    return evaluate(wrapWithS(func.body), newProg)

}
const wrapWithS = (val: value): sExpression => {
    if (val.type === "sExpression") return val;
    return {
        type: "sExpression",
        values: [val]
    }
}
const callMain: sExpression = {
    type: "sExpression",
    values: [{
        type: "identifier",
        value: "main",
        ...dummyData
    }]
}

const runProgram = (prog: program): string => {
    return evaluate(callMain, prog)
}
const main = () => {
    const file = fs.readFileSync("./src/example.alisp", "utf-8")
    const res = parse(file)
    const program = ASTtoProgram(res)
    console.log(program.names.get("main"))
    console.log("runProgram", runProgram(program))
    // console.log(JSON.stringify(paredast, null, 4))
    // fs.writeFileSync("./dump.json", JSON.stringify(paredast, null, 4))
}
main()