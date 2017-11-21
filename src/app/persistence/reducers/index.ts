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

export const getProjectState = createSelector(getPersistenceState, (state: State) => state.project)

// Project meta

export const getProjectMeta = createSelector(getProjectState, fromProject.getProjectMeta)

export const getProjectId = createSelector(getProjectMeta, meta => {
  return meta ? meta.get('id', null): null
})

export const getProjectTimeline = createSelector(getProjectMeta, meta => {
  return meta ? meta.get('timeline', null): null
})

export const getFlattenedAnnotations = createSelector(getProjectTimeline, timeline => {
  if(timeline !== null) {
    return timeline.get('tracks', null).flatMap((track, trackIndex) => {
      const color = track.get('color', null)
      return track.get('annotations', null).map((annotation, annotationIndex) => {
        return new AnnotationColorMapRecordFactory({
          trackIndex, color, annotation, annotationIndex
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

export const getProjectVideo = createSelector(getProjectState, fromProject.getProjectVideo)

export const getVideoObjectURL = createSelector(getProjectVideo, video => {
  return video !== null ? URL.createObjectURL(video) : null
})


