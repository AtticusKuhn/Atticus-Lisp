const alispNamespace = {};
const doesPatternMatch = (pattern, args) => {
    console.log(`does`, pattern, ` match`, args)
    for (let i = 0; i < pattern.length; i++) {
        const p = pattern[i];
        let a = args[i];
        if (p.type === "variable") continue;
        if (a.type === "thunk") a = strict(a)
        if (typeof p === "symbol" && typeof a === "symbol" && p.toString() !== a.toString()) {
            return false;
        }
        if (p !== a) {
            console.log(p, "!==", a)
            return false;
        }
    }
    console.log("matches!")
    return true
}
const strict = (thunk) =>
    thunk.type === "thunk"
        ? strict(thunk.value())
        : thunk

const func = function () {
    let patterns = []
    return {
        patternMatch: function (patternMatch, body) {
            patterns.push([patternMatch, body])
            return this;
        },
        build: function () {
            return (...args) => {
                const matched = patterns.find(([p, _]) => doesPatternMatch(p, args));
                if (matched === undefined) {
                    console.log(`no pattern matched among`, patterns)
                    throw new Error(`no pattern matched `)
                }
                const [_, func] = matched
                const res = func(...args)
                return res
            }
        }
    }
};alispNamespace["<"] = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) < strict(b)
    }).build();
alispNamespace["+"] = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) + strict(b)
    }).build();
alispNamespace["-"] = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) - strict(b)
    }).build();
alispNamespace["if"] = func() .patternMatch([true, {type:"variable", value:"a"}, {type:"variable", value:"b"}], function(_, a, b){
        return a
    })
.patternMatch([false, {type:"variable", value:"a"}, {type:"variable", value:"b"}], function(_, a, b){
        return b
    }).build();
alispNamespace["fib"] = func() .patternMatch([0], function(_){
        return 0
    })
.patternMatch([1], function(_){
        return 1
    })
.patternMatch([{type:"variable", value:"n"}], function(n){
        return {type:"thunk", value: ()=> alispNamespace["+"]({type:"thunk", value: ()=> alispNamespace["fib"]({type:"thunk", value: ()=> alispNamespace["-"](n, 1) } ) } , {type:"thunk", value: ()=> alispNamespace["fib"]({type:"thunk", value: ()=> alispNamespace["-"](n, 2) } ) } ) } 
    }).build();
alispNamespace["main"] = func() .patternMatch([], function(){
        return {type:"thunk", value: ()=> alispNamespace["fib"](10) } 
    }).build();
;             console.log(strict(alispNamespace["main"]()));
    