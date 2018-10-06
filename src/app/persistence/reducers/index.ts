import {List, Record, Set} from 'immutable'

import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'

import {AnnotationColorMapRecordFactory, AnnotationSelection} from '../model'

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

export const getFlattenedAnnotations = createSelector(getProjectTimeline, timeline => {
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
})

const path = ['annotation', 'utc_timestamp']
export const getSortedFlattenedAnnotations = createSelector(getFlattenedAnnotations, annotations => {
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
})

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
