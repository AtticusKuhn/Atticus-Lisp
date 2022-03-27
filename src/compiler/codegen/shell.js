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
};