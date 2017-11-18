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
    case project.PROJECT_FETCH_SUCCESS: {
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
    }
    case project.PROJECT_UPDATE_ANNOTATION: {
      const {trackIndex, annotationIndex, annotation} = action.payload
      return state.setIn([
        'timeline', 'tracks', trackIndex,
        'annotations', annotationIndex
      ], annotation)
    }
    case project.PROJECT_ADD_TRACK: {
      const tracks = state.get('timeline', null)!.get('tracks', null)
      const newTracks = tracks.push(new TrackRecordFactory(action.payload))
      return state.setIn(['timeline', 'tracks'], newTracks)
    }
    case project.PROJECT_DELETE_TRACK: {
      const {trackIndex} = action.payload
      return state.deleteIn(['timeline', 'tracks', trackIndex])
    }
    default:
      return state
  }
}

export const getProjectId = (state: State) => state.get('id', null)

export const getVideoObjectURL = (state: State) => {
  const vb = state.get('videoBlob', null)
  return vb !== null ? URL.createObjectURL(vb) : null
}

export const getTimeline = (state: State) => state.get('timeline', null)
