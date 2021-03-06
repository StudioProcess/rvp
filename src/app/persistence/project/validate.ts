import {
  adaptLegacyAnnotations,
  adaptLegacyVideoMeta,
  adaptLegacyAnnotationFields
} from './adapt'
import {sortFactory} from '../../lib/sort'

const defaultSortFunc = sortFactory((a: any) => a.utc_timestamp)

function hasLegacyVideoMeta(projectData: any) {
  const meta = projectData.meta

  return isNil(meta.video) || isNil(meta.video.type)
}

function hasLegacyAnnotations(projectData: any) {
  const tracks = projectData.meta.timeline.tracks

  const hasLegacyAnnos = tracks.find((track: any) => {
    return !Array.isArray(track.annotationStacks)
  })

  return hasLegacyAnnos !== undefined
}

function hasLegacyAnnotationFields(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  const hasLegacyFields = tracks.find((track: any) => {
    const stacks = track.annotationStacks
    return stacks.find((stack: any) => {
      return stack.find((annotation: any) => {
        return annotation.fields.title !== undefined
      }) !== undefined
    }) !== undefined
  })
  return hasLegacyFields
}

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
    return isDupTrack || isNil(track.id) || track.annotationStacks.find((annotations: any) => {
      return annotations.find((annotation: any) => {
        const isDupAnnotation = annotationsIdMap[annotation.id] !== undefined // is unique?
        annotationsIdMap[annotation.id] = annotation.id // add to map
        return isDupAnnotation || isNil(annotation.id)
      }) !== undefined
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
    track.annotationStacks.forEach((annotations: any) => {
      annotations.forEach((annotation: any) => {
        annotation.id = annotationCounter++
      })
    })
  })
}

function ensureSortedAnnotations(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  projectData.meta.timeline.tracks = tracks.map((track: any) => {
    track.annotations = track.annotations.sort(defaultSortFunc)
    return track
  })
}

function ensureSortedAnnotationStacks(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  projectData.meta.timeline.tracks = tracks.map((track: any) => {
    track.annotationStacks.map((annotations: any[]) => {
      return annotations.sort(defaultSortFunc)
    })
    return track
  })
}

export function ensureValidProjectData(projectData: any) {
  if(hasLegacyAnnotations(projectData)) {
    ensureSortedAnnotations(projectData)
    adaptLegacyAnnotations(projectData)
  } else {
    ensureSortedAnnotationStacks(projectData)
  }

  if(hasLegacyAnnotationFields(projectData)) {
    adaptLegacyAnnotationFields(projectData)
  }

  if(hasLegacyVideoMeta(projectData)) {
    adaptLegacyVideoMeta(projectData)
  }

  if(hasFishyEntityIds(projectData)) {
    // Seems like some entity id is fishy - just overwrite for now
    ensureEntityIds(projectData)
  }
  // ensureSortedAnnotations(projectData)
}
