function isNil<T>(data: T) {
  return data === null || data === undefined
}

interface IdKeyMap {
  [key: number]: number
}

function hasFishyEntityIds(projectData: any) {
  const tracksIdMap: IdKeyMap = {}
  const annotationsIdMap: IdKeyMap = {}

  const meta = projectData.meta
  const timeline = meta.timeline
  const tracks = meta.timeline.tracks
  if(isNil(meta.id)) {
    return true
  }

  if(isNil(timeline.id)) {
    return true
  }

  const fishyTrackOrAnnotationId = tracks.find((track: any) => {
    const isDupTrack = tracksIdMap[track.id] !== undefined // is unique?
    tracksIdMap[track.id] = track.id // add to map
    return isDupTrack || isNil(track.id) || track.annotations.find((annotation: any) => {
      const isDupAnnotation = annotationsIdMap[annotation.id] !== undefined // is unique?
      annotationsIdMap[annotation.id] = annotation.id // add to map
      return isDupAnnotation || isNil(annotation.id)
    }) !== undefined
  })

  if(fishyTrackOrAnnotationId !== undefined) {
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

function ensureSortedAnnotations(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  projectData.meta.timeline.tracks = tracks.map((track: any) => {
    track.annotations = track.annotations.sort((a1: any, a2: any) => {
      const a1Start = a1.utc_timestamp
      const a2Start = a2.utc_timestamp
      if(a1Start < a2Start) {
        return -1
      } else if(a1Start > a2Start) {
        return 1
      } else {
        return 0
      }
    })
    return track
  })

  return projectData
}

export function ensureValidProjectData(projectData: any) {
  if(hasFishyEntityIds(projectData)) {
    // Seems like some entity id is fishy - just overwrite for now
    ensureEntityIds(projectData)
  }
  ensureSortedAnnotations(projectData)
}
