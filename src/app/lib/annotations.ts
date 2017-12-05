import {hasCollisionFactory} from '../lib/collision'

const defaultHasCollision = hasCollisionFactory((a: any) => a.utc_timestamp, (a: any) => (a.utc_timestamp + a.duration))

export function computeStacks(annotations: any[], fixateIndex?: number): any[] {
  if(annotations.length > 1) {
    const stack = []
    const colliding = []
    let rest = annotations
    let n = 1

    while(rest.length > 0) {
      while(n < rest.length && defaultHasCollision(rest[0], rest[n])) {
        colliding.push(rest[n++])
      }

      stack.push(rest[0])
      rest.splice(0, n)
      n = 1
    }
    const stacks = [stack]
    return stacks.concat(computeStacks(colliding))
  } else {
    return []
  }
}

