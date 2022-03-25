
const alispNamespace = {};
const func = function () {
       const blankFunc = () => null;
       blankFunc.patternMatch = function (patternMatch, body) {
              const old = this;
              const newFunc = function (...args) {

              }
              return newFunc
       }
       return blankFunc;
}
alispNamespace["<"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (...args) {
       return alispNamespace["a"] < alispNamespace["b"]
});
alispNamespace["+"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (...args) {
       return alispNamespace["a"] + alispNamespace["b"]
});
alispNamespace["-"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (...args) {
       return alispNamespace["a"] - alispNamespace["b"]
});
alispNamespace["if"] = func().patternMatch([Symbol("true"), { type: "variable", value: "a" }, { type: "variable", value: "b" }], function (...args) {
       return alispNamespace["a"]
})
       .patternMatch([Symbol("false"), { type: "variable", value: "a" }, { type: "variable", value: "b" }], function (...args) {
              return alispNamespace["b"]
       });
alispNamespace["main"] = func().patternMatch([], function (...args) {
       return alispNamespace["if"](Symbol("true"))(true)(false)
});
;; alispNamespace["main"]()
