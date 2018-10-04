// sg ~ startGetter, eg ~ endGetter
export function hasCollisionFactory<T, S>(sg: (t:T)=>S, eg: (t:T, total:number)=>S): (t1: T, t2: T, total: number) => boolean {
  return (a1: T, a2: T, total: number) => {
    return sg(a2) <= eg(a1, total) && eg(a2, total) >= sg(a1)
  }
}
