import { runProgram } from "./compiler/interpretor/interpretor"
import { parse, value, ASTtoProgram } from "./compiler/parser/parser"
import fs from "fs"



export const runCompiler = (soureCode: string): value => {
    const stdlib = fs.readFileSync("./src/examples/stdlib.alisp", "utf-8");
    const res = parse(stdlib + "\n" + soureCode)
    const program = ASTtoProgram(res)
    // console.log(program.names.get("main"))
    return runProgram(program)
}
const main = () => {
    const file = fs.readFileSync("./src/examples/conditionals.alisp", "utf-8")
    console.log(runCompiler(file))
    // console.log(JSON.stringify(paredast, null, 4))
    // fs.writeFileSync("./dump.json", JSON.stringify(paredast, null, 4))
}
if (require.main === module) {
    main()
}