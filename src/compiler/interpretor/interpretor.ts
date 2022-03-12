import { dummyData, func, program, sExpression, value, wrapWithS } from "../parser/parser";

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func: Function): string[] {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
const toVal = (x: any): value => {
    if (typeof x === "number") return {
        type: "number_literal",
        value: x,
        ...dummyData
    }
    if (typeof x === "string") return {
        type: "string_literal",
        value: x,
        ...dummyData
    }
    if (x?.type) return x;
    throw new Error(`cannot convert to value ${x} ${JSON.stringify(x)}`)
}
const evaluate = (exprToCall: sExpression, prog: program): value => {
    console.log(`calling ${JSON.stringify(exprToCall, null, 4)}`)
    // if(exprToCall)
    let first: value
    try {
        first = exprToCall.values[0];
    } catch {
        return exprToCall;
    }
    if (first.type === "string_literal" || first.type === "number_literal") return first
    const args = exprToCall.values.slice(1);
    if (first.type !== "identifier") throw new Error(`cannot call a non-identifier. I tried to call a ${first.type}. Debug info: ${JSON.stringify(first, null, 2)}`)
    const funcName = first.value
    if (funcName === "compile") {
        // const compilerInstructions = evaluate(parse(`(compile ${funcName})`)[0], newProg)
        // console.log("compilerInstructions", compilerInstructions)
        // if (compilerInstructions) {
        console.log("creating a js func")
        //@ts-ignore
        const jsfunc = eval(evaluate(wrapWithS(args[0]), prog).value)
        const params = getParamNames(jsfunc);

        console.log("evaluating a js func")
        const funcParams = params.map((p) => {
            const x = prog.names.get(p)
            if (!x) throw new Error(`cannot get x`)
            const e = evaluate(wrapWithS(x.body), prog)
            if (e.type === "sExpression") {
                throw new Error(`why is it an s expression?`)
            } else {
                return e.value
            }
        }, prog)
        console.log("funcParams", funcParams)
        return toVal(jsfunc(...funcParams));
        // }
    }
    const func = prog.names.get(funcName);
    const argumentsContext: Map<string, func> = new Map() // name to value
    if (func) {
        console.log(`${funcName} has ${func.arguments.length} arugments`)
        console.log(prog.names)
        console.log("names values", prog.names.forEach((k, v) => {
            console.log(`key ${v} is value`, JSON.stringify(k.body))
        }));
        // if (func?.arguments) {
        for (let i = 0; i < func.arguments.length; i++) {
            console.log(`setting ${func.arguments[i].name}`)
            if (argumentsContext.get(func.arguments[i].name) !== undefined) throw new Error(`cannot redefine constant "${func.arguments[i].name}"`)
            argumentsContext.set(func.arguments[i].name, {
                arguments: [],
                body: evaluate(wrapWithS(args[i]), prog)
            })
        }
        // }

    } else {
        // console.log("func doesn't exist for ", funcName)
    }
    for (const arg of args) {
        if (arg.type === "identifier") {
            let argval = prog.names.get(arg.value)
            if (!argval) throw new Error(`cannot find value for the function argument "${arg.value}"`)
            const newarg = evaluate(wrapWithS(argval.body), prog)
            // if (argumentsContext.get(arg.value) !== undefined) throw new Error(`cannot redefine constant "${arg.value}"
            // The old value of "${arg.value}" was  ${JSON.stringify(argumentsContext.get(arg.value), null, 4)} and you are trying
            // to redefine it to be ${JSON.stringify(newarg)}
            // `)

            argumentsContext.set(arg.value, {
                arguments: [],
                body: newarg,//{ type: "number_literal", value: 1 }///evaluate(wrapWithS(arg), prog)
            });
        } else {

            // throw new Error(`arg must be identifier, it was actually of type ${arg.type}. Arg =  ${JSON.stringify(arg, null, 2)}`)
        }
    }
    console.log("argumentsContext is", argumentsContext)
    const newContext = new Map([...prog.names, ...argumentsContext])
    const newProg: program = { names: newContext }
    console.log("func is", funcName)
    if (!func) {
        console.log(`cannot find func "${funcName}" in`, newProg.names)

        throw new Error(`cannot find func. Tried to call a function called "${funcName}", but does not exist in this context`)
    }
    console.log("evaluated body of func")
    return evaluate(wrapWithS(func.body), newProg)

}

const callMain: sExpression = {
    type: "sExpression",
    values: [{
        type: "identifier",
        value: "main",
        ...dummyData
    }]
}

export const runProgram = (prog: program): value => {
    return evaluate(callMain, prog)
}