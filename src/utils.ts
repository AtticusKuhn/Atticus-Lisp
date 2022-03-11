export type either<A, B> = {
    type: "fail",
    value: A,
} | { type: "success", value: B }
export const left = <A, B>(a: A): either<A, B> => ({ type: "fail", value: a })
export const right = <A, B>(b: B): either<A, B> => ({ type: "success", value: b })
export const eitherBind = <A, B, C>(func: (val: B) => C) => (e: either<A, B>): either<A, C> =>
    e.type === "fail" ?
        e
        : { type: "success", value: func(e.value) }

