import { ASTtoProgram, parse, program, value } from "../parser/parser";
import fs from "fs"
const codeGenValueToJavascript = (value: value): string => {
    switch (value.type) {
        case "identifier":
            return value.value
        case "number_literal":
            return value.value.toString()
        case "sExpression":
            const fst = value.values[0]
            const rst = value.values.slice(1)
            if (fst.type === "identifier") {
                if (fst.value === "compile")
                    return codeGenValueToJavascript(rst[0])
                return `alispNamespace["${fst.value}"](${rst.map(a => `(${codeGenValueToJavascript(a)})`).join(",")})`
            } else {
                return `[${value.values.map(codeGenValueToJavascript).join(", ")}]`
            }
        case "string_literal":
            return value.value
        case "keyword_symbol":
            return `Symbol("${value.value}")`
    }
}
/*
alispNamespace["if"] = (a) => (b) => (c) =>
        doesPatternMatch([Symbol("true"), { variable: "a" }, { variable: "b" }], [a, b, c])
                ? a()
                : doesPatternMatch([Symbol("false"), { variable: "a" }, { variable: "b" }], [a, b, c])
                        ? b()
                        : error()
                        */
export const codegenToJavascript = (program: program): string => {
    let main = ""
    for (const [name, funcs] of program.names.entries()) {
        let funstring = ` alispNamespace["${name}"] = `
        funstring += `${funcs[0].arguments.map((_, i) => `(a_${i})=>`).join(" ")} `
        funstring += `{
                    `
        funstring += `return ` +
            `${funcs.map(f => `doesPatternMatch([${f.arguments.map(codeGenValueToJavascript).join(", ")}], [${f.arguments.map((_, i) => `a_${i}`).join(", ")}]) 
        ? ${codeGenValueToJavascript(f.body)} : `).join(" ")
            }
                    error("no pattern matched"); `
        funstring += `}; \n`
        main += funstring
    }
    return `
                const alispNamespace = {}

                ${main}
                `
}
const runtime = `
                const doesPatternMatch = () => {
                    return true
                }
                const error = (e) => {
                    throw new Error(e)
                }
                alispNamespace["main"]()
                    `
export const JSCodeGen = (soureCode: string): string => {
    const stdlib = fs.readFileSync("./src/examples/stdlib.alisp", "utf-8");
    const res = parse(stdlib + "\n" + soureCode)
    const program = ASTtoProgram(res)
    return runtime + codegenToJavascript(program)
}