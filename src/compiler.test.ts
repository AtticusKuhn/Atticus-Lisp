const { runCompiler } = require("../dist/index.js");


test("adding", () => {
    expect(runCompiler(`
    (+ a b 
        (compile "(a,b)=> a+b"))
    (main (+ 1 2))
    `).value).toBe(3);
});
test("succ", () => {
    expect(runCompiler(`
    (+ a b
        (compile "(a,b)=> a+b"))
    (succ x (+ x 1))
    (main (succ 1))
    `).value).toBe(2);
});

test("double succ", () => {
    expect(runCompiler(`
    (+ a b
        (compile "(a,b)=> a+b"))
    (succ x (+ x 1))
    (main (succ (succ 1)))
    `).value).toBe(3);
});