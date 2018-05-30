export function sortFactory<T, S>(getter: (t: T) => S) {
  return (t1: T, t2: T) => {
    const t1Val = getter(t1)
    const t2Val = getter(t2)
    if(t1Val < t2Val) {
      return -1
    } else if(t1Val > t2Val) {
      return 1
    } else {
      return 0
    }
  }
}
