import {List} from 'immutable'

import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'

import {AnnotationColorMapRecordFactory} from '../model'

export interface State {
  readonly project: fromProject.State,
}

export const reducers: ActionReducerMap<State> = {
  project: fromProject.reducer
}

// Project selectors
const getPersistenceState = createFeatureSelector<State>('persistence')

const getProjectState = createSelector(getPersistenceState, (state: State) => state.project)

export const getProjectId = createSelector(getProjectState, fromProject.getProjectId)

export const getVideoObjectURL = createSelector(
  getProjectState,
  fromProject.getVideoObjectURL)

export const getTimeline = createSelector(
  getProjectState,
  fromProject.getTimeline)

export const getFlattenedAnnotations = createSelector(getTimeline, timeline => {
  if(timeline !== null) {
    return timeline.get('tracks', null).flatMap((track, trackIndex) => {
      const color = track.get('color', null)
      return track.get('annotations', null).map(annotation => {
        return new AnnotationColorMapRecordFactory({
          trackIndex, color, annotation
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
