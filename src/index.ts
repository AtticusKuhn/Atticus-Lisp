import nearley from "nearley"
import fs from "fs"
import { left, right, either, eitherBind } from "./utils"
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
    "value": 4,
} & tokenData;
type string_literal = {
    "type": "string_literal",
    value: string,
} & tokenData;
type identifier = {
    "type": "identifier",
    "value": string,
} & tokenData;
function parse(code: string): either<string, AST> {
    // Parse something!
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
        parser.feed(code);
        if (parser.results.length > 1) {
            for (let i = 0; i < parser.results.length; i++) {
                console.log("ambiguous parser")
                // fs.writeFileSync(`./debug/${i}.json`, JSON.stringify(parser.results[i], null, 4))
            }
            return left("ambiguous parser")
        }
        if (parser.results.length === 0) {
            return left("no parse found")
        }
        return right(parser.results[0])
    } catch (e) {
        return left(e as string);
    }
}

const main = () => {
    const file = fs.readFileSync("./src/example.alisp", "utf-8")
    const res = parse(file)
    eitherBind<string, AST, void>((paredast) => {
        console.log(JSON.stringify(paredast, null, 4))
        fs.writeFileSync("./dump.json", JSON.stringify(paredast, null, 4))
    })(res)
}
main()