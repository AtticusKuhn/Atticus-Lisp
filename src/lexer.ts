import moo from "moo"
export const lexer = moo.compile({
    ws: /[ \t]+/,
    nl: { match: /[\n\s]/, lineBreaks: true },
    lParen: /\(/,
    rParen: /\)/,
    string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
        value: s => JSON.parse(s)
    },
    number_literal: {
        //@ts-ignore
        match: /[0-9]+(?:\.[0-9]+)?/,
        value: s => Number(s)
    },
    identifier: {
        match: /[^\s]+/,
    },
});

export default lexer
