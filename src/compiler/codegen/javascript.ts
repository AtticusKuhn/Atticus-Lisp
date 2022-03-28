import { ASTtoProgram, parse, program, value, func } from "../parser/parser";
import fs from "fs"
const codeGenValueToJavascript = (value: value, args: value[]): string => {
    switch (value.type) {
        case "identifier":
            return `${value.value}`
        case "number_literal":
            return value.value.toString()
        case "sExpression":
            const fst = value.values[0]
            const rst = value.values.slice(1)
            if (fst.type === "identifier") {
                if (fst.value === "compile")
                    return codeGenValueToJavascript(rst[0], args).replace(/\$([^\s]+)/g, (match) => {
                        return `strict(${match.substring(1)})`
                    })
                if (args.some(x => x.type === "identifier" && x.value === fst.value)) {
                    return `{type:"thunk", value: ()=> ${fst.value} } `
                }
                return `{type:"thunk", value: ()=> alispNamespace["${fst.value}"](${rst.map(a => `${codeGenValueToJavascript(a, args)}`).join(", ")}) } `
            } else {
                return `[${value.values.map((x) => codeGenValueToJavascript(x, args)).join(", ")}]`
            }
        case "string_literal":
            return value.value
        case "keyword_symbol":
            if (value.value === "true") return "true"
            if (value.value === "false") return "false"
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
        funstring += funcs[0].arguments.length > 0 ? `${funcs[0].arguments.map((_, i) => `(a_${i})=>`).join(" ")} ` : "()=>"
        funstring += `{
         console.log("${name} called");          `
        funstring += `return ` +
            `${funcs.map(f => `doesPatternMatch([${f.arguments.map((x) => codeGenValueToJavascript(x, [])).join(", ")}], [${f.arguments.map((_, i) => `a_${i}`).join(", ")}]) 
        ? ${codeGenValueToJavascript(f.body, [])} : `).join(" ")
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
const genPatternMatch = (value: value): string =>
    value.type === "identifier" ? `{type:"variable", value:"${value.value}"}`
        : value.type === "number_literal" ? value.value.toString()
            : value.type === "keyword_symbol" ? (
                value.value === "true" ? "true" :
                    value.value === "false" ? "false" : `Symbol("${value.value}")`)
                : value.type === "string_literal" ? `"${value.value}"`
                    : value.type === "sExpression" ? "idk"
                        : "idk2"
const mapDefs = (func: func): string => {
    return `.patternMatch([${func.arguments.map(genPatternMatch).join(", ")}], function(${func.arguments.map(genArgs).join(", ")}){
        return ${codeGenValueToJavascript(func.body, func.arguments)}
    })`
}
const codegenToJavascript2 = (program: program): string => {
    let main = ""
    for (const [name, funcs] of program.names.entries()) {
        main += `alispNamespace["${name}"] = func() ${funcs.map(mapDefs).join("\n")}.build();\n`
    }
    return fs.readFileSync("./src/compiler/codegen/shell.js", "utf-8") + main
}

export const JSCodeGen = (soureCode: string): string => {
    const stdlib = fs.readFileSync("./src/examples/stdlib.alisp", "utf-8");
    const res = parse(stdlib + "\n" + soureCode)
    const program = ASTtoProgram(res)
    console.log(program.names.get("fib"))
    return codegenToJavascript2(program) + `;             console.log(strict(alispNamespace["main"]()));
    `
}

const genArgs = (args: value): string => args.type === "identifier"
    ? args.value
    : "_"