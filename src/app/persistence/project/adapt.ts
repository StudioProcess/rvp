import {computeStacks} from '../../lib/annotations'

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
