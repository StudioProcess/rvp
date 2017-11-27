import {Record, List} from 'immutable'

import * as project from '../actions/project'

import {_SNAPSHOTS_MAX_STACKSIZE_} from '../../config/snapshots'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory,
  ProjectMetaRecordFactory, Timeline, ProjectSnapshot,
  ProjectSnapshotRecordFactory
} from '../model'

const initialState = new ProjectRecordFactory()

export type State = Record<Project>

function nextTrackId(timeline: Record<Timeline>): number {
  let maxId = -1
  const tracks = timeline.get('tracks', [])
  tracks.forEach(track => {
    const curId = track.get('id', -1) as number
    if(curId > maxId) {
      maxId = curId
    }
  })

  return maxId+1
}

function nextAnnotationId(timeline: Record<Timeline>): number {
  let maxId = -1
  const tracks = timeline.get('tracks', [])
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
      const trackPartial = action.payload
      const nextId = nextTrackId(state.getIn(['meta', 'timeline']))
      return state.updateIn(['meta', 'timeline', 'tracks'], tracks => {
        return tracks.push(new TrackRecordFactory({
          id: nextId,
          color: trackPartial.color,
          fields: trackPartial.fields,
          annotations: trackPartial.annotations
        }))
      })
    }
    case project.PROJECT_UPDATE_TRACK: {
      const {trackIndex, track} = action.payload
      return state.setIn(['meta', 'timeline', 'tracks', trackIndex], track)
    }
    case project.PROJECT_DELETE_TRACK: {
      const {trackIndex} = action.payload
      return state.deleteIn(['meta', 'timeline', 'tracks', trackIndex])
    }
    case project.PROJECT_PUSH_UNDO: {
      return state.updateIn(['snapshots', 'undo'], (undoList: List<Record<ProjectSnapshot>>) => {
        if(undoList.size < _SNAPSHOTS_MAX_STACKSIZE_) {
          // Insert first
          return undoList.unshift(action.payload)
        } else {
          // Remove last, insert first
          return undoList.pop().unshift(action.payload)
        }
      })
    }
    case project.PROJECT_UNDO: {
      const undoList: List<Record<ProjectSnapshot>> = state.getIn(['snapshots', 'undo'])
      if(undoList.size > 0) {
        const snapshot = undoList.first()!
        const updatedRedo = state.updateIn(['snapshots', 'redo'], (redoList: List<Record<ProjectSnapshot>>) => {
          if(redoList.size < _SNAPSHOTS_MAX_STACKSIZE_) {
            return redoList.unshift(snapshot)
          } else {
            return redoList.pop().unshift(snapshot)
          }
        })

        const updatedUndo = updatedRedo.setIn(['snapshots', 'undo'], undoList.shift())
        return updatedUndo.set('meta', snapshot.get('state', null))
      }

      return state
    }
    case project.PROJECT_REDO: {
      const redoList: List<Record<ProjectSnapshot>> = state.getIn(['snapshots', 'redo'])
      if(redoList.size > 0) {
        const snapshot = redoList.first()!
        const updatedUndo = state.updateIn(['snapshots', 'undo'], (undoList: List<Record<ProjectSnapshot>>) => {
          if(undoList.size < _SNAPSHOTS_MAX_STACKSIZE_) {
            return undoList.unshift(snapshot)
          } else {
            return undoList.pop().unshift(snapshot)
          }
        })

        const updatedRedo = updatedUndo.setIn(['snapshots', 'redo'], redoList.shift())
        return updatedRedo.set('meta', snapshot.get('state', null))
      }

      return state
    }
    case project.PROJECT_CLEAR_REDO: {
      return state.setIn(['snapshots', 'redo'], List())
    }
    default: {
      return state
    }
  }
}

export const getProjectMeta = (state: State) => {
  return state.get('meta', null)
}
export const getProjectVideo = (state: State) => state.get('video', null)
