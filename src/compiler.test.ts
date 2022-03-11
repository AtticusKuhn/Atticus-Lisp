const { runCompiler } = require("../dist/index.js");


test("adding", () => {
    expect(runCompiler(`
    (+ a b 
        (compile "(a,b)=> a+b"))
    (main (+ 1 2))
    `)).toBe(3);
});
test("succ", () => {
    expect(runCompiler(`
    (+ a b
        (compile "(a,b)=> a+b"))
    (succ a (+ a 1))
    (main (succ 1))
    `)).toBe(2);
});
//TODO: this currently causes an infinite loop
test("double succ", () => {
    expect(runCompiler(`
    (+ a b
        (compile "(a,b)=> a+b"))
    (succ a (+ a 1))
    (main (succ (succ 1)))
    `)).toBe(3);
});