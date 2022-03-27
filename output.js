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
};const < = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) < strict(b)
    }).build();
const + = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) + strict(b)
    }).build();
const - = func() .patternMatch([{type:"variable", value:"a"}, {type:"variable", value:"b"}], function(a, b){
        return strict(a) - strict(b)
    }).build();
const if = func() .patternMatch([true, {type:"variable", value:"a"}, {type:"variable", value:"b"}], function(true, a, b){
        return {type:"thunk", value: ()=> a() } 
    })
.patternMatch([false, {type:"variable", value:"a"}, {type:"variable", value:"b"}], function(false, a, b){
        return {type:"thunk", value: ()=> b() } 
    }).build();
const rec = func() .patternMatch([{type:"variable", value:"t"}], function(t){
        return {type:"thunk", value: ()=> if({type:"thunk", value: ()=> <(t, 0) } , 0, {type:"thunk", value: ()=> +(1, {type:"thunk", value: ()=> rec({type:"thunk", value: ()=> -(t, 1) } ) } ) } ) } 
    }).build();
const main = func() .patternMatch([], function(){
        return {type:"thunk", value: ()=> rec(2) } 
    }).build();
;             console.log(strict(alispNamespace["main"]()));
    