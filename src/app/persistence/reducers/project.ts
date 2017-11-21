import {Record, List} from 'immutable'

import * as project from '../actions/project'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory,
  ProjectMetaRecordFactory
} from '../model'

const initialState = new ProjectRecordFactory()

export type State = Record<Project>

export function reducer(state: State = initialState, action: project.Actions): State {
  switch(action.type) {
    case project.PROJECT_LOAD_SUCCESS: {
      const {meta: {id, timeline}, video} = action.payload
      // Create immutable representation
      return new ProjectRecordFactory({
        video,
        meta: ProjectMetaRecordFactory({
          id,
          timeline: TimelineRecordFactory({
            ...timeline,
            tracks: List(timeline.tracks.map((track: any) => {
              const {title} = track.fields
              return new TrackRecordFactory({
                ...track,
                fields: TrackFieldsRecordFactory({title}),
                annotations: List(track.annotations.map((annotation: any) => {
                  const {title, description} = annotation.fields
                  return new AnnotationRecordFactory({
                    ...annotation,
                    fields: new AnnotationFieldsRecordFactory({title, description}),
                  })
                }))
              })
            }))
          })
        })
      })
    }
    case project.PROJECT_ADD_ANNOTATION: {
      const {trackIndex, annotation} = action.payload
      const a = annotation.set('id', Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
      return state.updateIn(['timeline', 'tracks', trackIndex, 'annotations'], annotations => {
        return annotations.push(a)
      })
    }
    case project.PROJECT_UPDATE_ANNOTATION: {
      const {trackIndex, annotationIndex, annotation} = action.payload
      return state.setIn([
        'timeline', 'tracks', trackIndex,
        'annotations', annotationIndex
      ], annotation)
    }
    case project.PROJECT_DELETE_ANNOTATION: {
      const {trackIndex, annotationIndex} = action.payload
      return state.updateIn(['timeline', 'tracks', trackIndex, 'annotations'], annotations => {
        return annotations.delete(annotationIndex)
      })
    }
    case project.PROJECT_ADD_TRACK: {
      return state.updateIn(['timeline', 'tracks'], tracks => {
        return tracks.push(new TrackRecordFactory(action.payload))
      })
    }
    case project.PROJECT_DELETE_TRACK: {
      const {trackIndex} = action.payload
      return state.deleteIn(['timeline', 'tracks', trackIndex])
    }
    default:
      return state
  }
}

export const getProjectMeta = (state: State) => state.get('meta', null)

export const getProjectVideo = (state: State) => state.get('video', null)
