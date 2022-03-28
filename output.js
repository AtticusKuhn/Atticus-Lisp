const alispNamespace = {};
const doesPatternMatch = (pattern, args) => {
    for (let i = 0; i < pattern.length; i++) {
        const p = pattern[i];
        let a = args[i];
        if (p.type === "variable") continue;
        if (a.type === "thunk") a = strict(a)
        if (typeof p === "symbol" && typeof a === "symbol" && p.toString() !== a.toString()) {
            return false;
        }
        if (p !== a) {
            return false;
        }
    }
    return true
}
const strict = (thunk) =>
    thunk.type === "thunk"
        ? strict(thunk.value())
        : thunk

const curry = (fn) => {
    const curried = (...args) => {
        if (fn.length !== args.length) {
            return curried.bind(null, ...args)
        }
        return fn(...args);
    };
    return curried;
}
const func = function () {
    let patterns = []
    return {
        patternMatch: function (patternMatch, body) {
            patterns.push([patternMatch, body])
            return this;
        },
        build: function () {
            return curry((...args) => {
                const matched = patterns.find(([p, _]) => doesPatternMatch(p, args));
                if (matched === undefined) {
                    console.log(`no pattern matched among`, patterns)
                    throw new Error(`no pattern matched `)
                }
                const [_, func] = matched
                const res = func(...args)
                return res
            })
        }
    }
};
alispNamespace["list"] = (...args) => args; alispNamespace["<"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (a, b) {
    return strict(a) < strict(b)
}).build(); alispNamespace["<"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (a, b) {
    return strict(a) < strict(b)
}).build();
alispNamespace["+"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (a, b) {
    return strict(a) + strict(b)
}).build();
alispNamespace["-"] = func().patternMatch([{ type: "variable", value: "a" }, { type: "variable", value: "b" }], function (a, b) {
    return strict(a) - strict(b)
}).build();
alispNamespace["map"] = func().patternMatch([{ type: "variable", value: "f" }, { type: "variable", value: "xs" }], function (f, xs) {
    return strict(xs).map(strict(f))
}).build();
alispNamespace["if"] = func().patternMatch([true, { type: "variable", value: "a" }, { type: "variable", value: "b" }], function (_, a, b) {
    return a
})
    .patternMatch([false, { type: "variable", value: "a" }, { type: "variable", value: "b" }], function (_, a, b) {
        return b
    }).build();
alispNamespace["myList"] = func().patternMatch([], function () {
    return { type: "thunk", value: () => alispNamespace["list"](1, 2, 3, 4, 5) }
}).build();
alispNamespace["main"] = func().patternMatch([], function () {
    return { type: "thunk", value: () => alispNamespace["map"]({ type: "thunk", value: () => alispNamespace["+"](1) })(alispNamespace["myList"]) }
}).build();
; console.log(strict(alispNamespace["main"]()));
