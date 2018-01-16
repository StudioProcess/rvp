// sg ~ startGetter, eg ~ endGetter
export function hasCollisionFactory<T, S>(sg: (t:T)=>S, eg: (t:T)=>S): (t1: T, t2: T) => boolean {
  return (a1: T, a2: T) => {
    return sg(a2) <= eg(a1) && eg(a2) >= sg(a1)
  }
}
