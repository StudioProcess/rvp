import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'

import {AnnotationColorMap} from '../model'

export interface State {
  project: fromProject.State,
}

export const reducers: ActionReducerMap<State> = {
  project: fromProject.reducer
}

// Project selectors
export const getPersistenceState = createFeatureSelector<State>('persistence')

export const getProjectState = createSelector(getPersistenceState, (state: State) => state.project)

export const getVideo = createSelector(
  getProjectState,
  fromProject.getVideo)

export const getVideoObjectURL = createSelector(
  getProjectState,
  fromProject.getVideoObjectURL)

export const getTimeline = createSelector(
  getProjectState,
  fromProject.getTimeline)

export const getFlattenedAnnotations = createSelector(getTimeline, timeline => {
  if(timeline !== null) {
    const init: AnnotationColorMap[] = []
    const annotations = timeline.tracks.reduce((accum, track) => {
      const {color} = track
      return accum.concat(track.annotations.map(annotation => ({annotation, color})))
    }, init)

    return annotations
  } else {
    return []
  }
})

export const getSortedFlattenedAnnotations = createSelector(getFlattenedAnnotations, annotations => {
  return annotations.sort((a1, a2) => {
    if(a1.annotation.utc_timestamp < a2.annotation.utc_timestamp) {
      return -1
    } else if(a1.annotation.utc_timestamp > a2.annotation.utc_timestamp) {
      return 1
    } else {
      return 0
    }
  })
})
