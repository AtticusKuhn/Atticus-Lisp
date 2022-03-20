import { value } from "./compiler/parser/parser";

export const stringify = (v: value): string => {
    switch (v.type) {
        case "identifier":
            return v.value
        case "number_literal":
            return v.value.toString()
        case "sExpression":
            return `(${v.values.map(stringify).join(" ")})`
        case "string_literal":
            return v.value
        case "keyword_symbol":
            return `:${v.value}`
    }
}