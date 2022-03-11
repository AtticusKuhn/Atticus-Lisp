# About
I have been fascinated a long time by [lisps](https://en.wikipedia.org/wiki/Lisp_(programming_language)) such as [clojure](https://clojure.org/)
so I decided to make my own lisp. This lisp is called **Atticus Lisp**, and
is designed to be a simple lisp. This language is not done yet, and it is still
in development. 

# Syntax
The syntax of Atticus Lisp is designed to be very simple

# Example programs
Addition in Atticus Lisp
```lisp
(+ a b
    (compile "(a,b)=> a+b"))

(succ a (+ a 1))

(main (succ 1))
```
Note that the "main" function is called. 

Fibonnaci in Atticus Lisp 
```lisp
(= x y (compile "(x,y)=>Number(x===y)"))
(+ a b (compile "(a,b)=>a+b"))
(- p q (compile "(p,q)=>p-q"))

(if c y n (compile "(c,y,n)=> c ? y : n"))


(fib n 
    (if
        (= n 1) 1
        (+ 
            (fib 
                (- n 2))
            (fib 
                (- n 1)))))

(main (fib 10))
```



# Todo
- [ ] expand the standard library
