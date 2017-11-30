import {Record, List, Set} from 'immutable'

import * as project from '../actions/project'

import {_SNAPSHOTS_MAX_STACKSIZE_} from '../../config/snapshots'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory,
  ProjectMetaRecordFactory, Timeline, ProjectSnapshot,
  ProjectSnapshotRecordFactory, Track, Annotation,
  AnnotationSelection, AnnotationSelectionRecordFactory
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

function getAllSelections(state: State): Set<Record<AnnotationSelection>> {
  const rangeSelections = state.getIn(['selection', 'annotation', 'range'])
  const pickSelections = state.getIn(['selection', 'annotation', 'pick'])
  const selected = state.getIn(['selection', 'annotation', 'selected'])
  const selectedSet = Set().add(selected)
  return rangeSelections.union(pickSelections).union(selectedSet)
}

const findAnnotationFunc = (annotationId: number) => (annotationSelection:Record<AnnotationSelection>) => {
  const selectedAnnotation = annotationSelection.get('annotation', null)!
  return selectedAnnotation.get('id', null) === annotationId
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

      const annotationId = annotation.get('id', null)!
      const singleSel: Record<AnnotationSelection> = state.getIn(['selection', 'annotation', 'selected'])
      const clipboardAnnotations = state.get('clipboard', null)

      const findFunc = findAnnotationFunc(annotationId)

      let inSelection = singleSel !== null && singleSel.get('annotation', null)!.get('id', null) === annotationId ? singleSel : null
      let inClipboard = !clipboardAnnotations.isEmpty() ? clipboardAnnotations.find(findFunc) : null

      if(inSelection || inClipboard) {
        return state.withMutations(mState => {
          if(inSelection) {
            const updatedSingleSel = inSelection.set('annotation', annotation)
            mState.setIn(['selection', 'annotation', 'selected'], updatedSingleSel)
          }

          if(inClipboard) {
            const updatedClipboard = inClipboard.set('annotation', annotation)
            mState.set('clipboard', clipboardAnnotations.delete(inClipboard).add(updatedClipboard))
          }

          mState.setIn([
            'meta', 'timeline', 'tracks', trackIndex,
            'annotations', annotationIndex
          ], annotation)
        })
      } else {
      return state.setIn([
        'meta', 'timeline', 'tracks', trackIndex,
        'annotations', annotationIndex
      ], annotation)
    }
    }
    case project.PROJECT_DELETE_SELECTED_ANNOTATIONS: {
      const all = getAllSelections(state)
      const selectedAnnotations = all.map(annotationSelection => {
        return annotationSelection.get('annotation', null)!
      })

      if(!all.isEmpty()) {
        const fa = all.first()!
        const track = fa.get('track', null)!
        const tracks: List<Record<Track>> = state.getIn(['meta', 'timeline', 'tracks'])
        const trackIndex = tracks.findIndex(t => t.get('id', null) === track.get('id', null))!
        const cTrack = tracks.get(trackIndex)!
        const cAnnotations = cTrack.get('annotations', null)

        const updatedAnnotations = cAnnotations.filter(ann => {
          return !selectedAnnotations.has(ann)
        })

        return state.withMutations(mState => {
          mState.setIn(['meta', 'timeline', 'tracks', trackIndex, 'annotations'], updatedAnnotations)
          mState.setIn(['selection', 'annotation', 'range'], Set())
          mState.setIn(['selection', 'annotation', 'pick'], Set())
          mState.setIn(['selection', 'annotation', 'selected'], null)
        })
      } else {
        return state
      }
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
      const track: Record<Track> = state.getIn(['meta', 'timeline', 'tracks', trackIndex])
      const allSelections = getAllSelections(state)

      // Deleted track is track with selections? If so, clear selection
      if(!allSelections.isEmpty()) {
        const fs = allSelections.first()!
        const trackWithSelections = fs.get('track', null)!
        if(track.get('id',null) === trackWithSelections.get('id', null)) {
          return state.withMutations(mState => {
            mState.setIn(['selection', 'annotation', 'range'], Set())
            mState.setIn(['selection', 'annotation', 'pick'], Set())
            mState.setIn(['selection', 'annotation', 'selected'], null)
            mState.deleteIn(['meta', 'timeline', 'tracks', trackIndex])
          })
        }
      }
      // Otherwise just delete track
      return state.deleteIn(['meta', 'timeline', 'tracks', trackIndex])
    }
    case project.PROJECT_DUPLICATE_TRACK: {
      const {trackIndex} = action.payload
      const timeline = state.getIn(['meta', 'timeline'])
      const track = state.getIn(['meta', 'timeline', 'tracks', trackIndex])
      const duplicate = track.withMutations((mutableTrack: any) => {
        mutableTrack.set('id', nextTrackId(timeline))
        const oldTitle = track.getIn(['fields', 'title'])
        mutableTrack.setIn(['fields', 'title'], oldTitle !== '' ? `${oldTitle} Copy` : '')
        mutableTrack.set('annotations', mutableTrack.get('annotations').map((annotation: any, i: number) => {
          return annotation.set('id', nextAnnotationId(timeline)+i)
        }))
      })

      return state.updateIn(['meta', 'timeline', 'tracks'], tracks => {
        return tracks.insert(trackIndex+1, duplicate)
      })
    }
    case project.PROJECT_INSERTAT_TRACK: {
      const {currentTrackIndex, insertAtIndex} = action.payload
      const tracks = state.getIn(['meta', 'timeline', 'tracks'])
      const swapped = tracks.withMutations((mTracks: any) => {
        // mTracks ~ mutableTracks
        const tmp = mTracks.get(currentTrackIndex)
        mTracks.set(currentTrackIndex, mTracks.get(insertAtIndex))
        mTracks.set(insertAtIndex, tmp)
      })

      return state.setIn(['meta', 'timeline', 'tracks'], swapped)
    }
    case project.PROJECT_PUSH_UNDO: {
      const updatedRedo = state.setIn(['snapshots', 'redo'], List())
      return updatedRedo.updateIn(['snapshots', 'undo'], (undoList: List<Record<ProjectSnapshot>>) => {
        // Ensure max snapshot stack size
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
      const redoList: List<Record<ProjectSnapshot>> = state.getIn(['snapshots', 'redo'])
      if(undoList.size > 0) {
        const undoSnapshot = undoList.first()!
        const currentSnapshot = new ProjectSnapshotRecordFactory({
          timestamp: Date.now(),
          state: state.get('meta', null)!
        })
        const updatedRedo = state.setIn(['snapshots', 'redo'], redoList.unshift(currentSnapshot))
        const updatedUndo = updatedRedo.setIn(['snapshots', 'undo'], undoList.shift())
        return updatedUndo.set('meta', undoSnapshot.get('state', null))
      }
      return state
    }
    case project.PROJECT_REDO: {
      const undoList: List<Record<ProjectSnapshot>> = state.getIn(['snapshots', 'undo'])
      const redoList: List<Record<ProjectSnapshot>> = state.getIn(['snapshots', 'redo'])
      if(redoList.size > 0) {
        const redoSnapshot = redoList.first()!
        const currentSnapshot = new ProjectSnapshotRecordFactory({
          timestamp: Date.now(),
          state: state.get('meta', null)!
        })
        const updatedUndo = state.setIn(['snapshots', 'undo'], undoList.unshift(currentSnapshot))
        const updatedRedo = updatedUndo.setIn(['snapshots', 'redo'], redoList.shift())
        return updatedRedo.set('meta', redoSnapshot.get('state', null))
      }
      return state
    }
    case project.PROJECT_SELECT_ANNOTATION: {
      const {type, selection} = action.payload
      switch(type) {
        case project.AnnotationSelectionType.Default: {
          return state.withMutations(mState => {
            mState.setIn(['selection', 'annotation', 'range'], Set())
            mState.setIn(['selection', 'annotation', 'pick'], Set())
            mState.setIn(['selection', 'annotation', 'selected'], selection)
          })
        }
        case project.AnnotationSelectionType.Pick: {
          const track = selection.get('track', null)!
          const filterByTrackFunc = (sel: Record<AnnotationSelection>) => {
            return sel.getIn(['track', 'id']) === track.get('id', null)
          }

          const rangeSelections: Set<Record<AnnotationSelection>> = state.getIn(['selection', 'annotation', 'range']).filter(filterByTrackFunc)
          const pickSelections: Set<Record<AnnotationSelection>> = state.getIn(['selection', 'annotation', 'pick']).filter(filterByTrackFunc)
          const peekSelected: Record<AnnotationSelection>|null = state.getIn(['selection', 'annotation', 'selected'])
          const isAlreadyPicked = rangeSelections.has(selection) || pickSelections.has(selection)

          return state.withMutations(mState => {
            if(isAlreadyPicked) {
              mState.setIn(['selection', 'annotation', 'range'], rangeSelections.delete(selection))
              mState.setIn(['selection', 'annotation', 'pick'], pickSelections.delete(selection))

              if(peekSelected && peekSelected.getIn(['annotation', 'id']) === selection.getIn(['annotation', 'id'])) {
                mState.setIn(['selection', 'annotation', 'selected'], null)
              }
            } else {
              // Set range, might be different due to filter
              mState.setIn(['selection', 'annotation', 'range'], rangeSelections)
              if(peekSelected && peekSelected.getIn(['track', 'id']) === track.get('id', null) && rangeSelections.isEmpty()) {
                mState.setIn(['selection', 'annotation', 'pick'], pickSelections.add(selection).add(peekSelected))
              } else {
                mState.setIn(['selection', 'annotation', 'pick'], pickSelections.add(selection))
              }
              mState.setIn(['selection', 'annotation', 'selected'], selection)
            }
          })
        }
        case project.AnnotationSelectionType.Range: {
          const source = selection.get('source', null)!
          const track = selection.get('track', null)!
          const filterByTrackFunc = (sel: Record<AnnotationSelection>) => {
            return sel.get('track', null)!.get('id', null)! === track.get('id', null)
          }
          const annotation = selection.get('annotation', null)!
          const annotations = track.get('annotations', null)

          const sortFunc = (a1: Record<Annotation>, a2: Record<Annotation>) => {
            return a1.get('utc_timestamp', null)! - a2.get('utc_timestamp', null)!
          }
          const sortedAnnotations = annotations.sort(sortFunc)
          const peekSelected: Record<AnnotationSelection>|null = state.getIn(['selection', 'annotation', 'selected'])
          const fa: Record<Annotation> = track.getIn(['annotations']).sort(sortFunc).first() // fa ~ first annotation in current track

          const pivot: Record<Annotation> = peekSelected && peekSelected.getIn(['track', 'id']) === track.get('id', null) ?
            peekSelected.get('annotation', null)! : fa
          const limit = annotation

          const pivotKey = sortedAnnotations.findIndex(a => a.get('id', null) === pivot.get('id', null))!
          const limitKey = sortedAnnotations.findIndex(a => a.get('id', null) === limit.get('id', null))!

          const range = pivotKey < limitKey ?
            sortedAnnotations.slice(pivotKey, limitKey+1):
            sortedAnnotations.slice(limitKey, pivotKey+1)

          const rangeSelectionRecords = range.map(aRec => {
            return AnnotationSelectionRecordFactory({track, annotation: aRec, source})
          })

          return state.withMutations(mState => {
            const pickSelections = mState.getIn(['selection', 'annotation', 'pick'])
            mState.setIn(['selection', 'annotation', 'pick'], pickSelections.filter(filterByTrackFunc))

            const rangeSelection = rangeSelectionRecords.toSet()
            mState.setIn(['selection', 'annotation', 'range'], rangeSelection)

            if(peekSelected === null || peekSelected.getIn(['track', 'id']) !== track.get('id', null)) {
              const newSelectionRecord = AnnotationSelectionRecordFactory({
                track, annotation: fa, source
              })
              mState.setIn(['selection', 'annotation', 'selected'], newSelectionRecord)
            }
          })
        }
      }
    }
    case project.PROJECT_SELECTION_RESETALL_ANNOTATION: {
      return state.withMutations(mState => {
        mState.setIn(['selection', 'annotation', 'range'], Set())
        mState.setIn(['selection', 'annotation', 'pick'], Set())
        mState.setIn(['selection', 'annotation', 'selected'], null)
      })
    }
    case project.PROJECT_COPY_ANNOTATION_SELECTION_TO_CLIPBOARD: {
      const all = getAllSelections(state)
      return state.set('clipboard', all)
    }
    case project.PROJECT_PASTE_CLIPBOARD: {
      const {trackIndex} = action.payload
      const all = state.get('clipboard', null)!
      if(!all.isEmpty()) {
        const timeline = state.getIn(['meta', 'timeline'])
        const annotations: List<Record<Annotation>> = state.getIn(['meta', 'timeline', 'tracks', trackIndex, 'annotations'])

        const newAnnotations = all.toList().map((annotationSelection, i) => {
          const annotation = annotationSelection.get('annotation', null)!
          return annotation.set('id', nextAnnotationId(timeline)+i)
        })

        return state.withMutations(mState => {
          mState.set('clipboard', Set())
          const concatAnnotations = annotations.concat(newAnnotations)
          mState.setIn(['meta', 'timeline', 'tracks', trackIndex, 'annotations'], concatAnnotations)
        })
      } else {
        return state
      }
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

export const getProjectSelection = (state: State) => {
  return state.get('selection', null)
}
