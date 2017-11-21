function isNil<T>(data: T) {
  return data === null || data === undefined
}

function hasEntityIdsMissing(projectData: any) {
  const meta = projectData.meta
  const timeline = meta.timeline
  const tracks = meta.timeline.tracks
  if(isNil(meta.id)) {
    return true
  }

  if(isNil(timeline.id)) {
    return true
  }

  const missingTrackOrAnnotationId = tracks.find((track: any) => {
    return isNil(track.id) || track.annotations.find((annotation: any) => {
      return isNil(annotation.id)
    }) !== undefined
  })

  if(missingTrackOrAnnotationId !== undefined) {
    return true
  }

  return false
}

function ensureEntityIds(projectData: any) {
  const projectCounter = 0
  const timelineCounter = 0
  let trackCounter = 0
  let annotationCounter = 0

  const meta = projectData.meta
  const timeline = meta.timeline
  const tracks = meta.timeline.tracks

  meta.id = projectCounter

  timeline.id = timelineCounter

  tracks.forEach((track: any) => {
    track.id = trackCounter++
    track.annotations.forEach((annotation: any) => {
      annotation.id = annotationCounter++
    })
  })
}

export function ensureValidProjectData(projectData: any) {
  if(hasEntityIdsMissing(projectData)) {
    // Seems like some entity id is missing - just overwrite for now
    ensureEntityIds(projectData)
  }
}
