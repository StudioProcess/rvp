import {List, Record} from 'immutable'

import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'

import {AnnotationColorMap, AnnotationColorMapRecordFactory} from '../model'

export interface State {
  project: fromProject.State,
}

export const reducers: ActionReducerMap<State> = {
  project: fromProject.reducer
}

// Project selectors
export const getPersistenceState = createFeatureSelector<State>('persistence')

export const getProjectState = createSelector(getPersistenceState, (state: State) => state.project)

export const getVideoObjectURL = createSelector(
  getProjectState,
  fromProject.getVideoObjectURL)

export const getTimeline = createSelector(
  getProjectState,
  fromProject.getTimeline)

// TODO: use Seq to create flattened?
export const getFlattenedAnnotations = createSelector(getTimeline, timeline => {
  if(timeline !== null) {
    const init: List<Record<AnnotationColorMap>> = List([])
    const tracks = timeline.get('tracks', null)

    const flattened = tracks.reduce((accum, track, trackIndex) => {
      const color = track.get('color', null)
      const annotations = track.get('annotations', null)
      return accum.concat(annotations.map(annotation => {
        return new AnnotationColorMapRecordFactory({
          trackIndex, color, annotation
        })
      }))
    }, init)

    return flattened
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
