
const doesPatternMatch = () => {
       return true
}
const error = (e) => {
       throw new Error(e)
}

const alispNamespace = {}

alispNamespace["<"] = (a_0) => (a_1) => {
       return doesPatternMatch([a, b], [a_0, a_1])
              ? a < b :
              error("no pattern matched");
};
alispNamespace["+"] = (a_0) => (a_1) => {
       return doesPatternMatch([a, b], [a_0, a_1])
              ? a + b :
              error("no pattern matched");
};
alispNamespace["-"] = (a_0) => (a_1) => {
       return doesPatternMatch([a, b], [a_0, a_1])
              ? a - b :
              error("no pattern matched");
};
alispNamespace["if"] = (a_0) => (a_1) => (a_2) => {
       return doesPatternMatch([Symbol("true"), a, b], [a_0, a_1, a_2])
              ? alispNamespace["a"]() : doesPatternMatch([Symbol("false"), a, b], [a_0, a_1, a_2])
                     ? alispNamespace["b"]() :
                     error("no pattern matched");
};
alispNamespace["main"] = () => {
       return doesPatternMatch([], [])
              ? alispNamespace["if"](Symbol("true"), true, false) :
              error("no pattern matched");
};
console.log(alispNamespace["main"]()()())
console.log("hi")

