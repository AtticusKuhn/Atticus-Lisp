@{%
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

%}

@lexer lexer

program -> __ml statements __ml {% d=>d[1] %}
statements -> statement _ml statements {%(d)=>[d[0], ...d[2]]%}
    | statement {%(d)=>d%}
statement ->  sExpression  {%id%}
sExpression -> %lParen value_list %rParen {%(d)=>({
    type:"sExpression",
    values: d[1],
})%}
value_list -> value  {%(d)=>d%}
    | value _ml value_list {%(d)=>[d[0], ...d[2]]%}
value -> sExpression  {%id%}
    | %number_literal {%id%}
    | %string_literal {%id%}
    | %identifier {%id%}
    | %keyword_symbol {%id%}


__ml -> multi_line_ws_char:*
_ml -> multi_line_ws_char:+

multi_line_ws_char
    -> %ws
    | %nl

__ -> %ws:+

_ -> %ws:*