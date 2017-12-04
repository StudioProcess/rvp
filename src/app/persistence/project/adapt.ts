function start(annotation: any) {
  return annotation.utc_timestamp
}

function end(annotation: any) {
  return annotation.utc_timestamp + annotation.duration
}

function hasCollision(a1: any, a2: any) {
  return end(a1) > start(a2) && start(a1) < end(a2)
}

function computeStacks(annotations: any[]): any[] {
  if(annotations.length > 2) {
    const stack = []
    const colliding = []
    let rest = annotations
    let n = 1
    while(rest.length > 1) {
      while(hasCollision(rest[0], rest[n])) {
        colliding.push(rest[n++])
      }

      stack.push(rest[0])
      rest.splice(0, n)
    }
    const stacks = [stack]
    return stacks.concat(computeStacks(colliding))
  } else {
    return [annotations]
  }
}

function ensureAnnotationStacks(projectData: any) {
  const tracks = projectData.meta.timeline.tracks

  projectData.meta.timeline.tracks = tracks.map((track: any) => {
    const annotationStacks = computeStacks(track.annotations)
    return {
      id: track.id,
      color: track.color,
      fields: track.fields,
      annotationStacks
    }
  })
}

export function adaptLegacyModel(projectData: any) {
  ensureAnnotationStacks(projectData)
}
