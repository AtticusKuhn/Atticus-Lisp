import nearley from "nearley"
// import lexer from "./lexer";
// import fs from "fs"
const grammar = require("../../../grammar.js")
// Create a Parser object from our grammar.

export type tokenData = {
    "text": string,
    "offset": number,
    "lineBreaks": number,
    "line": number,
    "col": number
}
export const dummyData: tokenData = {
    "text": "",
    col: 0,
    line: 0,
    lineBreaks: 0,
    offset: 0
}
export type AST = sExpression[];
export type sExpression = {
    type: "sExpression",
    values: value[]
}
export type value = sExpression
    | number_literal
    | string_literal
    | identifier
export type number_literal = {
    "type": "number_literal",
    "value": number,
} & tokenData;
export type string_literal = {
    "type": "string_literal",
    value: string,
} & tokenData;
export type identifier = {
    "type": "identifier",
    "value": string,
} & tokenData;
export type program = {
    names: Map<string, func>,
}
export type func = {
    arguments: { name: string }[],
    body: value,
}
export function parse(code: string): AST {
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
export const ASTtoProgram = (ast: AST): program => {
    const map = new Map<string, func>();
    ast.forEach((sExp) => {
        const first = sExp.values[0];
        if (first.type === "identifier") {
            const func: func = {
                arguments: sExp.values.slice(1, sExp.values.length - 1).map((val) => {
                    if (val.type === "sExpression") {
                        throw new Error(`function argument cannot be s expression. Argument was ${JSON.stringify(val, null, 4)} 
                        Expected val to be a value, val was actually ${val.type}`)
                    } else {
                        return {
                            name: val.text
                        }
                    }
                }),
                body: wrapWithS(sExp.values[sExp.values.length - 1])
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
export const makeIdentifier = (name: string): identifier => ({
    type: "identifier",
    value: name,
    ...dummyData
})
export const wrapWithS = (val: value): sExpression => {
    if (val.type === "sExpression") return val;
    return {
        type: "sExpression",
        values: [val]
    }
}