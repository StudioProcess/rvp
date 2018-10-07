import {List, Record, Set} from 'immutable'

import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as Fuse from 'fuse.js'

import * as fromProject from './project'
import * as fromPlayer from '../../player/reducers'

import {findVerticalCollisionsWithCursor} from '../../lib/annotationStack'

import {_FUSE_OPTIONS_} from '../../config/search'

import {
  AnnotationColorMapRecordFactory, AnnotationSelection,
  AnnotationColorMap, Timeline
} from '../model'

export interface State {
  readonly project: fromProject.State,
}

export const reducers: ActionReducerMap<State> = {
  project: fromProject.reducer
}

// Project selectors
const getPersistenceState = createFeatureSelector<State>('persistence')

export const getProjectState = createSelector(getPersistenceState, (state: State) => state.project)

export const getProjectSettings = createSelector(getProjectState, fromProject.getProjectSettings)

export const getProjectSettingsShowCurrentAnnotationsOnly = createSelector(getProjectSettings, settings => settings.get('showCurrentAnnotationsOnly', false))
export const getProjectSettingsSearch = createSelector(getProjectSettings, settings => settings.get('search', null))
export const getProjectSettingsApplyToTimeline = createSelector(getProjectSettings, settings => settings.get('applyToTimeline', false))
// Project meta

export const getProjectMeta = createSelector(getProjectState, fromProject.getProjectMeta)

export const getProjectId = createSelector(getProjectMeta, meta => {
  return meta ? meta.get('id', null): null
})

export const getProjectVideoMeta = createSelector(getProjectMeta, meta => {
  return meta ? meta.get('video', null): null
})

export const getProjectTimeline = createSelector(getProjectMeta, meta => {
  return meta ? meta.get('timeline', null): null
})

function flattenAnnotations(timeline: Record<Timeline>|null) {
  if(timeline !== null) {
    return timeline.get('tracks', null).flatMap((track, trackIndex) => {
      const color = track.get('color', null)
      return track.get('annotationStacks', null).flatMap((annotations, annotationStackIndex) => {
        return annotations.map((annotation, annotationIndex) => {
          return new AnnotationColorMapRecordFactory({
            track, trackIndex, color, annotation, annotationIndex, annotationStackIndex
          })
        })
      })
    })
  } else {
    return List([])
  }
}

export const getFlattenedAnnotations = createSelector(getProjectTimeline, timeline => {
  return flattenAnnotations(timeline)
})

const sortAnnotations = (annotations: List<Record<AnnotationColorMap>>) => {
  const path = ['annotation', 'utc_timestamp']

  return annotations.sort((a1, a2) => {
    const a1Start = a1.getIn(path)
    const a2Start = a2.getIn(path)
    if(a1Start < a2Start) {
      return -1
    } else if(a1Start > a2Start) {
      return 1
    } else {
      return 0
    }
  })
}

export const getSortedFlattenedAnnotations = createSelector(getFlattenedAnnotations, sortAnnotations)


export const getCurrentFlattenedAnnotations = createSelector(
  getProjectSettings, getProjectTimeline, fromPlayer.getCurrentTime,
  (settings, timeline, currentTime) => {
    if(settings.get('showCurrentAnnotationsOnly', false)) {
      const duration = timeline!.get('duration', null)

      const tracks = timeline!.get('tracks', null)
      const res: Record<AnnotationColorMap>[] = []
      tracks.forEach((track, trackIndex) => {
        const color = track.get('color', null)
        const stacks = track.get('annotationStacks', null)
        const collisions = findVerticalCollisionsWithCursor(duration, stacks, currentTime)
        const mapped = collisions.map(({annotation, annotationIndex, annotationStackIndex}) => {
          return new AnnotationColorMapRecordFactory({
            track, trackIndex, color, annotation, annotationIndex, annotationStackIndex
          })
        })
        res.push(...mapped)
      })

      return List(res)
    } else {
      return flattenAnnotations(timeline)
    }
  })

export const getCurrentQueriedFlattenedAnnotations = createSelector(
  getProjectSettings, getCurrentFlattenedAnnotations,
  (settings, annotations) => {
    const search = settings.get('search', null)
    if(search !== null) {
      const jsAnnotations = annotations.toJS()
      const fuse = new Fuse(jsAnnotations, _FUSE_OPTIONS_)
      const res: string[] = fuse.search(search)
      return annotations.filter(ann => {
        const aId = ann.getIn(['annotation', 'id'])
        return res.find(id => parseInt(id) === aId)
      })
    } else {
      return annotations
    }
  })

export const getCurrentQueriedSortedFlattenedAnnotations = createSelector(getCurrentQueriedFlattenedAnnotations, sortAnnotations)

// Project video

export const getProjectVideoBlob = createSelector(getProjectState, fromProject.getProjectVideoBlob)


// Selection

export const getProjectSelection = createSelector(getProjectState, fromProject.getProjectSelection)

export const getProjectAnnotationSelection = createSelector(getProjectSelection, selection => {
  return selection.get('annotation', null)
})

export const getProjectFocusAnnotationSelection = createSelector(getProjectAnnotationSelection, annotationSelection => {
  return annotationSelection.get('selected', null)
})

// Get complete annotation selection info
export const getAnnotationsSelections = createSelector(getProjectAnnotationSelection, annotationSelection => {
  const ranged = annotationSelection.get('range', null)
  const picked = annotationSelection.get('pick', null)
  const selected = annotationSelection.get('selected', null)
  const selectedSet: Set<Record<AnnotationSelection>> = selected ? Set().add(selected) : Set()
  return ranged.union(picked, selectedSet)
})

// Just pick annotation from selection info
export const getSelectedAnnotations = createSelector(getAnnotationsSelections, annotationSelections => {
  return annotationSelections.map(elem => {
    return elem.get('annotation', null)!
  })
})
