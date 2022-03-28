import fs from "fs";
import { JSCodeGen } from "./compiler/codegen/javascript";
import { runProgram } from "./compiler/interpretor/interpretor";
import { ASTtoProgram, parse, value } from "./compiler/parser/parser";



export const runCompiler = (soureCode: string): value => {
    const stdlib = fs.readFileSync("./src/examples/stdlib.alisp", "utf-8");
    const res = parse(stdlib + "\n" + soureCode)
    const program = ASTtoProgram(res)
    // console.log(program.names.get("main"))
    return runProgram(program)
}
const main = () => {
    const file = fs.readFileSync("./src/examples/lists.alisp", "utf-8")
    fs.writeFileSync("./output.js", JSCodeGen(file))
    // console.log(runCompiler(file))
    // console.log(JSON.stringify(paredast, null, 4))
    // fs.writeFileSync("./dump.json", JSON.stringify(paredast, null, 4))
}
if (require.main === module) {
    main()
}