import {computeStacks} from '../../lib/annotations'
import {VIDEO_TYPE_BLOB} from '../../persistence/model'

function ensureAnnotationStacks(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  const timelineDuration = projectData.meta.timeline.duration
  projectData.meta.timeline.tracks = tracks.map((track: any) => {
    const annotationStacks = computeStacks(timelineDuration, track.annotations)
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
    type: VIDEO_TYPE_BLOB
  }

  return projectData
}

export function adaptLegacyAnnotationFields(projectData: any) {
  const tracks = projectData.meta.timeline.tracks
  tracks.forEach((track: any, trackIndex: number) => {
    const stacks = track.annotationStacks
    return stacks.forEach((stack: any, stackIndex: number) => {
      projectData.meta.timeline.tracks[trackIndex].annotationStacks[stackIndex] = stack.map((annotation: any) => {
        if(annotation.fields.title !== undefined) {
          if(annotation.fields.description !== '') {
            return {
              ...annotation,
              fields: {
                description: `${annotation.fields.title}\n${annotation.fields.description}`
              }
            }
          } else {
            return {
              ...annotation,
              fields: {
                description: annotation.fields.title
              }
            }
          }
        } else {
          return annotation
        }
      })
    })
  })
}
