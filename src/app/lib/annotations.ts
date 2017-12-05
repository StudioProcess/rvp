

function start(annotation: any) {
  return annotation.utc_timestamp
}

function end(annotation: any) {
  return annotation.utc_timestamp + annotation.duration
}

function hasCollision(a1: any, a2: any) {
  return end(a1) > start(a2) && start(a1) < end(a2)
}

export function computeStacks(annotations: any[], fixateIndex?: number): any[] {
  if(annotations.length > 1) {
    const stack = []
    const colliding = []
    let rest = annotations
    let n = 1
    while(rest.length > 0) {
      while(n < rest.length && hasCollision(rest[0], rest[n])) {
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

