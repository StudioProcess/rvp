import {computeStacks} from '../../lib/annotations'
import {VIDEO_TYPE_BLOB} from '../../persistence/model'

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

export function adaptLegacyAnnotations(projectData: any) {
  ensureAnnotationStacks(projectData)
}

export function adaptLegacyVideoMeta(projectData: any) {
  // Just assume blob video
  projectData.meta.video = {
    type: VIDEO_TYPE_BLOB,
    blob: projectData.video
  }

  return projectData
}
