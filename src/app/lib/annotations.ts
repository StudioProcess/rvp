import {hasCollisionFactory} from '../lib/collision'
import {_HANDLEBAR_MIN_WIDTH_} from '../config/timeline/handlebar'

const defaultHasCollision = hasCollisionFactory(
  (a: any) => a.utc_timestamp,
  (a: any, timelineDuration) => {
    return a.utc_timestamp + Math.max(timelineDuration/100*_HANDLEBAR_MIN_WIDTH_, a.duration)
  })

export function computeStacks(timelineDuration: number, annotations: any[]): any[] {
  if(annotations.length > 1) {
    const stack = []
    const colliding = []
    const rest = annotations
    let n = 1

    while(rest.length > 0) {
      while(n < rest.length && defaultHasCollision(rest[0], rest[n], timelineDuration)) {
        colliding.push(rest[n++])
      }

      stack.push(rest[0])
      rest.splice(0, n)
      n = 1
    }
    const stacks = [stack]
    return colliding.length > 0 ? stacks.concat(computeStacks(timelineDuration, colliding)) : stacks
  } else {
    return [annotations]
  }
}

