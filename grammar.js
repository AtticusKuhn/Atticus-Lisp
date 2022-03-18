// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const { lexer } = require("./dist/compiler/parser/lexer")

function tokenStart(token) {
    return {
        line: token.line,
        col: token.col - 1
    };
}

function tokenEnd(token) {
    const lastNewLine = token.text.lastIndexOf("\n");
    if (lastNewLine !== -1) {
        throw new Error("Unsupported case: token with line breaks");
    }
    return {
        line: token.line,
        col: token.col + token.text.length - 1
    };
}

function convertToken(token) {
    return {
        type: token.type,
        value: token.value,
        start: tokenStart(token),
        end: tokenEnd(token)
    };
}

function convertTokenId(data) {
    return convertToken(data[0]);
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "program", "symbols": ["__ml", "statements", "__ml"], "postprocess": d=>d[1]},
    {"name": "statements", "symbols": ["statement", "_ml", "statements"], "postprocess": (d)=>[d[0], ...d[2]]},
    {"name": "statements", "symbols": ["statement"], "postprocess": (d)=>d},
    {"name": "statement", "symbols": ["sExpression"], "postprocess": id},
    {"name": "sExpression", "symbols": [(lexer.has("lParen") ? {type: "lParen"} : lParen), "value_list", (lexer.has("rParen") ? {type: "rParen"} : rParen)], "postprocess": (d)=>({
            type:"sExpression",
            values: d[1],
        })},
    {"name": "value_list", "symbols": ["value"], "postprocess": (d)=>d},
    {"name": "value_list", "symbols": ["value", "_ml", "value_list"], "postprocess": (d)=>[d[0], ...d[2]]},
    {"name": "value", "symbols": ["sExpression"], "postprocess": id},
    {"name": "value", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)], "postprocess": id},
    {"name": "value", "symbols": [(lexer.has("string_literal") ? {type: "string_literal"} : string_literal)], "postprocess": id},
    {"name": "value", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": id},
    {"name": "value", "symbols": [(lexer.has("keyword_symbol") ? {type: "keyword_symbol"} : keyword_symbol)], "postprocess": id},
    {"name": "__ml$ebnf$1", "symbols": []},
    {"name": "__ml$ebnf$1", "symbols": ["__ml$ebnf$1", "multi_line_ws_char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__ml", "symbols": ["__ml$ebnf$1"]},
    {"name": "_ml$ebnf$1", "symbols": ["multi_line_ws_char"]},
    {"name": "_ml$ebnf$1", "symbols": ["_ml$ebnf$1", "multi_line_ws_char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_ml", "symbols": ["_ml$ebnf$1"]},
    {"name": "multi_line_ws_char", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "multi_line_ws_char", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
