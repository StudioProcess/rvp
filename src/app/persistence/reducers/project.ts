import {Record, List} from 'immutable'

import * as project from '../actions/project'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory
} from '../model'

// export const TimelineFactory = Record<Timeline>({
//   duration: 0
// })

const initialState = new ProjectRecordFactory()

export type State = Record<Project>

export function reducer(state: State = initialState, action: project.Actions): State {
  switch(action.type) {
    case project.PROJECT_FETCH_SUCCESS:
      const {project:proj, videoBlob} = action.payload
      // Create immutable representation
      return new ProjectRecordFactory({
        ...proj,
        videoBlob,
        timeline: TimelineRecordFactory({
          ...proj.timeline,
          tracks: List(proj.timeline.tracks.map((track: any) => {
            const {title} = track.fields
            return new TrackRecordFactory({
              ...track,
              fields: TrackFieldsRecordFactory({title}),
              annotations: List(track.annotations.map((annotation: any) => {
                const {title, description} = annotation
                return new AnnotationRecordFactory({
                  ...annotation,
                  fields: new AnnotationFieldsRecordFactory({title, description}),
                })
              }))
            })
          }))
        })
      })
    case project.PROJECT_UPDATE_ANNOTATION:
      const {trackIndex, annotationIndex, annotation} = action.payload
      return state.setIn([
        'timeline', 'tracks', trackIndex,
        'annotations', annotationIndex
      ], annotation)
    default:
      return state
  }
}

export const getVideo = (state: State) => state.get('video', null)

export const getVideoObjectURL = (state: State) => {
  const vb = state.get('videoBlob', null)
  return vb !== null ? URL.createObjectURL(vb) : null
}

export const getTimeline = (state: State) => {
  return state.get('timeline', null)
}
