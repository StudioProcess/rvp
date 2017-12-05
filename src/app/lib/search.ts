export function binarySearch<T, S>(sortedList: T, size: number, getter: (list: T, i: number) => S, val: S): number {
  let l = 0
  let r = size-1
  let m, curVal

  while(l <= r) {
    m = Math.floor((l+r)/2)
    curVal = getter(sortedList, m)
    if(curVal < val) {
      l = m+1
    } else if(curVal > val) {
      r = m-1
    } else {
      return m
    }
  }
  return -1
}
