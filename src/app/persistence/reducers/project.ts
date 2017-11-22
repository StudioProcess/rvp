import {Record, List} from 'immutable'

import * as project from '../actions/project'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory,
  ProjectMetaRecordFactory, Timeline
} from '../model'

const initialState = new ProjectRecordFactory()

export type State = Record<Project>

function nextAnnotationId(timeline: Record<Timeline>): number {
  let maxId = -1
  const tracks = timeline.get('tracks', null)
  tracks.forEach(track => {
    const annotations = track.get('annotations', null)
    annotations.forEach(annotation => {
      const curId = annotation.get('id', -1) as number
      if(curId > maxId) {
        maxId = curId
      }
    })
  })

  return maxId+1
}

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
    case project.PROJECT_IMPORT_VIDEO_SUCCESS: {
      const video = action.payload
      return state.set('video', video)
    }
    case project.PROJECT_SET_TIMELINE_DURATION: {
      return state.setIn(['meta', 'timeline', 'duration'], action.payload.duration)
    }
    case project.PROJECT_ADD_ANNOTATION: {
      const {trackIndex, annotation} = action.payload
      const newId = nextAnnotationId(state.getIn(['meta', 'timeline']))
      const a = annotation.set('id', newId)
      return state.updateIn(['meta', 'timeline', 'tracks', trackIndex, 'annotations'], annotations => {
        return annotations.push(a)
      })
    }
    case project.PROJECT_UPDATE_ANNOTATION: {
      const {trackIndex, annotationIndex, annotation} = action.payload
      return state.setIn([
        'meta', 'timeline', 'tracks', trackIndex,
        'annotations', annotationIndex
      ], annotation)
    }
    case project.PROJECT_DELETE_ANNOTATION: {
      const {trackIndex, annotationIndex} = action.payload
      return state.updateIn(['meta', 'timeline', 'tracks', trackIndex, 'annotations'], annotations => {
        return annotations.delete(annotationIndex)
      })
    }
    case project.PROJECT_ADD_TRACK: {
      return state.updateIn(['meta', 'timeline', 'tracks'], tracks => {
        return tracks.push(new TrackRecordFactory(action.payload))
      })
    }
    case project.PROJECT_DELETE_TRACK: {
      const {trackIndex} = action.payload
      return state.deleteIn(['meta', 'timeline', 'tracks', trackIndex])
    }
    default:
      return state
  }
}

export const getProjectMeta = (state: State) => state.get('meta', null)

export const getProjectVideo = (state: State) => state.get('video', null)
