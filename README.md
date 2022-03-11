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


# Todo
 [ ] fix bug of infinite recursion
 [ ] expand the standard library
