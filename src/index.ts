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
                arguments: sExp.values.slice(1, sExp.values.length - 2).map((val) => {
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
const evaluate = (exprToCall: sExpression, prog: program): any => {
    console.log(`calling ${JSON.stringify(exprToCall, null, 4)}`)
    const first = exprToCall.values[0];
    if (first.type === "string_literal" || first.type === "number_literal") {
        return first
    }
    const args = exprToCall.values.slice(1);
    if (first.type === "identifier") {
        const funcName = first.value
        const func = prog.names.get(funcName);
        if (!func) {
            const compilerInstructions = evaluate(parse(`(compile ${funcName})`)[0], prog)
            console.log("compilerInstructions", compilerInstructions)
            if (compilerInstructions.value) {
                const jsfunc = eval(compilerInstructions.value)
                return jsfunc(...(args.map((a) => evaluate(wrapWithS(a), prog))))
            }
            throw new Error(`cannot find func. Tried to call a function called "${funcName}", but does not exist in this context`)
        }
        const argumentsContext: Map<string, func> = new Map() // name to value
        for (const arg of args) {
            if (arg.type === "identifier") {
                argumentsContext.set(arg.value, {
                    arguments: [],
                    body: arg
                });
            } else {
                // throw new Error(`arg must be identifier, it was actually of type ${arg.type}. Arg =  ${JSON.stringify(arg, null, 2)}`)
            }
        }
        const newContext = new Map([...argumentsContext, ...prog.names])
        const newProg: program = { names: newContext }
        return evaluate(wrapWithS(func.body), newProg)
    } else {
        throw new Error(`cannot call a non-identifier. I tried to call a ${first.type}. Debug info: ${JSON.stringify(first, null, 2)}`)
    }
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