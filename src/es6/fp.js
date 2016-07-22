
export function pipe (obj, funcs) {
    return funcs.reduce((prev, f) => {
        return f[0].apply(null, f.slice(1).concat([prev]))
    }, obj)
}
