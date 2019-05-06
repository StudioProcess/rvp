import {Record, List, Set} from 'immutable'

import * as project from '../actions/project'

import {_SNAPSHOTS_MAX_STACKSIZE_} from '../../config/snapshots'

import {
  Project, TimelineRecordFactory, ProjectRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationRecordFactory, AnnotationFieldsRecordFactory,
  ProjectMetaRecordFactory, Timeline, ProjectSnapshot,
  ProjectSnapshotRecordFactory, Track, Annotation,
  AnnotationSelection, AnnotationSelectionRecordFactory,
  BlobVideoRecordFactory, UrlVideoRecordFactory,
  ProjectHashtagsRecordFactory,
  VIDEO_TYPE_BLOB, VIDEO_TYPE_URL, VideoUrlSource, ProjectPlayerStateRecordFactory
} from '../model'

import {embedAnnotations} from '../../lib/annotationStack'
import {prepareHashTagList} from '../../lib/hashtags'

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
    const annotationStacks = track.get('annotationStacks', null)
    annotationStacks.forEach(annotations => {
      annotations.forEach(annotation => {
        const curId = annotation.get('id', -1) as number
        if(curId > maxId) {
          maxId = curId
        }
      })
    })
  })

  return maxId+1
}

function getAllSelections(state: State): Set<Record<AnnotationSelection>> {
  const rangeSelections = state.getIn(['selection', 'annotation', 'range'])
  const pickSelections = state.getIn(['selection', 'annotation', 'pick'])
  const selected = state.getIn(['selection', 'annotation', 'selected'])
  const selectedSet = selected !== null ? Set().add(selected) : Set()
  return rangeSelections.union(pickSelections).union(selectedSet)
}

export function reducer(state: State = initialState, action: project.Actions): State {
  switch(action.type) {
    case project.PROJECT_LOAD_SUCCESS: {
      /* Handle new project:
       * For `new project` there is no defined video, therefore
       * the video data from the previous state is used.
       */
      const prevDuration = state.getIn(['meta', 'timeline', 'duration'])
      const prevVideoMeta = state.getIn(['meta', 'video'])
      const prevVideoBlob = state.get('videoBlob', null)

      const {meta: {id, timeline, video:videoMeta, hashtags}, video} = action.payload

      if(videoMeta === null) {
        timeline.duration = prevDuration
      }

      if(videoMeta && videoMeta.type === VIDEO_TYPE_URL) {
        videoMeta.url = new URL(videoMeta.url)
      }
      // Create immutable representation
      return new ProjectRecordFactory({
        videoBlob: video === null ? prevVideoBlob: video,
        player: state.get('player', new ProjectPlayerStateRecordFactory()),
        meta: ProjectMetaRecordFactory({
          id,
          video: videoMeta === null ? prevVideoMeta : (videoMeta.type === VIDEO_TYPE_BLOB ? BlobVideoRecordFactory(videoMeta) : UrlVideoRecordFactory(videoMeta)),
          timeline: TimelineRecordFactory({
            ...timeline,
            tracks: List(timeline.tracks.map((track: any) => {
              const {title: trackTitle} = track.fields
              return new TrackRecordFactory({
                ...track,
                fields: TrackFieldsRecordFactory({title: trackTitle}),
                annotationStacks: List(track.annotationStacks.map((annotations: any) => {
                  return List(annotations.map((annotation: any) => {
                    const {description} = annotation.fields
                    return new AnnotationRecordFactory({
                      ...annotation,
                      fields: new AnnotationFieldsRecordFactory({description}),
                    })
                  }))
                }))
              })
            }))
          }),
          hashtags: ProjectHashtagsRecordFactory({
            list: (hashtags! && hashtags!.list) ? hashtags.list : null
          })
        })
      })
    }
    case project.PROJECT_IMPORT_VIDEO_SUCCESS: {
      const payload = action.payload
      switch(payload.type) {
        case VIDEO_TYPE_BLOB: {
          const blobVideo = payload.data as File|Blob
          return state
            .set('videoBlob', blobVideo)
            .setIn(['meta', 'video'], BlobVideoRecordFactory({type: VIDEO_TYPE_BLOB}))
        }
        case VIDEO_TYPE_URL: {
          const videoMeta = {
            type: VIDEO_TYPE_URL,
            source: payload.source as VideoUrlSource,
            url: payload.data as URL
          }
          return state
            .set('videoBlob', null)
            .setIn(['meta', 'video'], UrlVideoRecordFactory(videoMeta))
        }
      }
      return state
    }
    case project.PROJECT_SET_TIMELINE_DURATION: {
      return state.setIn(['meta', 'timeline', 'duration'], action.payload.duration)
    }
    case project.PROJECT_ADD_ANNOTATION: {
      const {trackIndex, annotationStackIndex, annotation, source} = action.payload

      let placedTrackIndex = trackIndex
      let placedAnnotation = annotation
      if(source === 'toolbar') {
        const tracks = state.getIn(['meta', 'timeline', 'tracks']) as List<Record<Track>>
        placedTrackIndex = tracks.findIndex(track => track.get('isActive', false))
        placedAnnotation = annotation.set('utc_timestamp', state.getIn(['player', 'currentTime']))
      }

      const annotationStacks = state.getIn(['meta', 'timeline', 'tracks', placedTrackIndex, 'annotationStacks'])
      const newId = nextAnnotationId(state.getIn(['meta', 'timeline']))
      const newAnnotation = placedAnnotation.set('id', newId)
      const timelineDuration = state.getIn(['meta', 'timeline', 'duration'])

      const stacksWithEmbedded = embedAnnotations(timelineDuration, annotationStacks, annotationStackIndex, List([newAnnotation]), List([]))
      return state.setIn(['meta', 'timeline', 'tracks', placedTrackIndex, 'annotationStacks'], stacksWithEmbedded)
    }
    case project.PROJECT_UPDATE_ANNOTATION: {
      const {trackIndex, annotationIndex, annotationStackIndex, annotation} = action.payload

      const path = ['meta', 'timeline', 'tracks', trackIndex, 'annotationStacks']
      const annotationStacks: List<List<Record<Annotation>>> = state.getIn(path)
      const prevAnnotation: Record<Annotation> = annotationStacks.getIn([annotationStackIndex, annotationIndex])
      const timelineDuration = state.getIn(['meta', 'timeline', 'duration'])

      const stacksWithEmbedded = embedAnnotations(timelineDuration, annotationStacks, annotationStackIndex, List([annotation]), List([prevAnnotation]))

      const annotationId = annotation.get('id', null)!
      const singleSel: Record<AnnotationSelection> = state.getIn(['selection', 'annotation', 'selected'])
      const inSelection = singleSel !== null && singleSel.getIn(['annotation', 'id']) === annotationId ? singleSel : null

      let updatedState = state
      if(inSelection) {
        const updatedSingleSel = inSelection.set('annotation', annotation)
        updatedState = state.setIn(['selection', 'annotation', 'selected'], updatedSingleSel)
      }
      return updatedState.setIn(path, stacksWithEmbedded)
    }
    case project.PROJECT_DELETE_SELECTED_ANNOTATIONS: {
      const all = getAllSelections(state)
      // const selectedAnnotations = all.map(annotationSelection => {
      //   return annotationSelection.get('annotation', null)!
      // })

      // const selectedAnnotationsList = selectedAnnotations.toList()

      if(!all.isEmpty()) {
        const firstSelAnnotation = all.first() as Record<AnnotationSelection>
        const selectedTrack = firstSelAnnotation.get('track', null)!
        const tracks: List<Record<Track>> = state.getIn(['meta', 'timeline', 'tracks'])
        const trackIndex = tracks.findIndex(t => t.get('id', null) === selectedTrack.get('id', null))!
        const annotationStacks: List<List<Record<Annotation>>> = tracks.get(trackIndex)!.get('annotationStacks', null)

        const timelineDuration = state.getIn(['meta', 'timeline', 'duration'])

        /**
         * TODO:
         * This is a quick fix solution.
         * Removing the selected annotations should not be implemented via `forEach`.
         * Instead one single call to `embedAnnotations(...)` with the list of
         * selected annotation to be removed.
         * Currently `embedAnnotations` only supports removing a single annotation at a time
         * due to historical reasons.
         * `embedAnnotations` needs to be adapted to support removing a list of annotations in a
         * single call.
         */
        let updatedStacks = annotationStacks
        all.forEach(removeAnnotationSel => {
          const annotation = removeAnnotationSel.get('annotation', null)!
          const annotationStackIndex = removeAnnotationSel.get('annotationStackIndex', null)!

          updatedStacks = embedAnnotations(timelineDuration, updatedStacks, annotationStackIndex, List([]), List([annotation]))
        })

        // remove stacks without annotations
        const cleanedStacks = updatedStacks.size > 1 ? updatedStacks.filter(stack => stack.size > 0): updatedStacks

        return state.setIn(['meta', 'timeline', 'tracks', trackIndex, 'annotationStacks'], cleanedStacks)
          .setIn(['selection', 'annotation', 'range'], Set())
          .setIn(['selection', 'annotation', 'pick'], Set())
          .setIn(['selection', 'annotation', 'selected'], null)
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
          color: trackPartial.color
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
        const fs = allSelections.first() as Record<AnnotationSelection>
        const trackWithSelections = fs.get('track', null)!
        if(track.get('id', null) === trackWithSelections.get('id', null)) {
          return state.setIn(['selection', 'annotation', 'range'], Set())
            .setIn(['selection', 'annotation', 'pick'], Set())
            .setIn(['selection', 'annotation', 'selected'], null)
            .deleteIn(['meta', 'timeline', 'tracks', trackIndex])
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
        let annotationCounter = 0
        mutableTrack.set('annotationStacks', mutableTrack.get('annotationStacks').map((stack: any) => {
          return stack.map((annotation: any) => {
            return annotation.set('id', nextAnnotationId(timeline)+(annotationCounter++))
          })
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
        const undoSnapshot = undoList.first() as Record<ProjectSnapshot>
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
        const redoSnapshot = redoList.first() as Record<ProjectSnapshot>
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

          const rangeSelections: Set<Record<AnnotationSelection>> =
            state.getIn(['selection', 'annotation', 'range']).filter(filterByTrackFunc)
          const pickSelections: Set<Record<AnnotationSelection>> =
            state.getIn(['selection', 'annotation', 'pick']).filter(filterByTrackFunc)
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
          const annotations = track.get('annotationStacks', null).flatMap(stack => stack)

          const sortFunc = (a1: Record<Annotation>, a2: Record<Annotation>) => {
            return a1.get('utc_timestamp', null)! - a2.get('utc_timestamp', null)!
          }
          const sortedAnnotations = annotations.sort(sortFunc)
          const peekSelected: Record<AnnotationSelection>|null = state.getIn(['selection', 'annotation', 'selected'])
          const fa: Record<Annotation> = sortedAnnotations.first() as Record<Annotation> // fa ~ first annotation in current track

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
      return state
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
    case project.PROJECT_UPDATE_HASHTAGS: {
      console.log('PROJECT_UPDATE_HASHTAGS', action!.payload!)
      const hashtags = prepareHashTagList(action.payload!.hashtags!)
      return state.setIn(['meta', 'hashtags', 'list'], hashtags)
    }
    case project.PROJECT_PASTE_CLIPBOARD: {
      const all = state.get('clipboard', null)!
      if(!all.isEmpty()) {
        const timeline = state.getIn(['meta', 'timeline'])

        const tracks = state.getIn(['meta', 'timeline', 'tracks']) as List<Record<Track>>
        const placedTrackIndex = tracks.findIndex(track => track.get('isActive', false))
        const placedAnnotationStacks = state.getIn(['meta', 'timeline', 'tracks', placedTrackIndex, 'annotationStacks'])

        const idOffset = nextAnnotationId(timeline)
        const newAnnotations = all.toList().map((annotationSelection, i) => {
          const annotation = annotationSelection.get('annotation', null)!
          return annotation.set('id', idOffset+i)
        })
        const timelineDuration = state.getIn(['meta', 'timeline', 'duration'])

        const sortedNewAnnotations = newAnnotations.sort((a1, a2) => {
          const a1Start = a1.get('utc_timestamp', 0)
          const a2Start = a2.get('utc_timestamp', 0)
          if(a1Start < a2Start) {
            return -1
          } else if(a1Start > a2Start) {
            return 1
          } else {
            return 0
          }
        })

        const firstNewAnnotation = sortedNewAnnotations.get(0)!

        const duration = state.getIn(['meta', 'timeline', 'duration']) as number
        const currentTime = state.getIn(['player', 'currentTime']) as number
        const playHeadDiff = currentTime-firstNewAnnotation.get('utc_timestamp', 0)

        const placedNewAnnotations = sortedNewAnnotations.map(a => {
          return a.set('utc_timestamp', Math.min(a.get('utc_timestamp', 0)+playHeadDiff, duration-a.get('duration', 0)))
        })

        const stacksWithEmbedded = embedAnnotations(timelineDuration, placedAnnotationStacks, 0, placedNewAnnotations, List([]))

        return state.withMutations(mState => {
          mState.setIn(['meta', 'timeline', 'tracks', placedTrackIndex, 'annotationStacks'], stacksWithEmbedded)
        })
      } else {
        return state
      }
    }
    case project.PROJECT_SETTINGS_SET_SHOW_CURRENT_ANNOTATIONS_ONLY: {
      return state.setIn(['settings', 'currentAnnotationsOnly'], action.payload)
    }
    case project.PROJECT_SETTINGS_SET_SEARCH: {
      return action.payload !== '' ?
        state.setIn(['settings', 'search'], action.payload):
        state.setIn(['settings', 'search'], null)
    }
    case project.PROJECT_SETTINGS_SET_APPLY_TO_TIMELINE: {
      return state.setIn(['settings', 'applyToTimeline'], action.payload)
    }
    case project.PROJECT_SET_ACTIVE_TRACK: {
      const activeTrackIndex = action.payload.trackIndex
      const tracks = state.getIn(['meta', 'timeline', 'tracks']) as List<Record<Track>>
      const numTracks = tracks.size

      return state.withMutations(mState => {
        for(let i = 0; i < numTracks; i++) {
          mState.setIn(['meta', 'timeline', 'tracks', i, 'isActive'], i === activeTrackIndex)
        }
      })
    }
    case project.PLAYER_CREATE_SUCCESS:
    case project.PLAYER_DESTROY_SUCCESS:
      return state
    case project.PLAYER_SET_CURRENT_TIME:
      return state.setIn(['player', 'currentTime'], action.payload.currentTime)
    case project.PLAYER_SET_DIMENSIONS_SUCCESS:
      return state
        .setIn(['player', 'width'], action.payload.width)
        .setIn(['player', 'height'], action.payload.height)
    default: {
      return state
    }
  }
}

export const getProjectSettings = (state: State) => {
  return state.get('settings', null)
}

export const getProjectMeta = (state: State) => {
  return state.get('meta', null)
}
export const getProjectVideoBlob = (state: State) => state.get('videoBlob', null)

export const getProjectSelection = (state: State) => {
  return state.get('selection', null)
}

export const getProjectClipboard = (state: State) => {
  return state.get('clipboard', null)
}

export const getProjectSnapshots = (state: State) => {
  return state.get('snapshots', null)
}

// player

export const getPlayerState = (state: State) => {
  return state.get('player', null)
}
