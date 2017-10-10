import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'
import * as fromLoading from './loading'

export interface State {
  project: fromProject.State,
  loading: fromLoading.State
}

export const reducers: ActionReducerMap<State> = {
  project: fromProject.reducer,
  loading: fromLoading.reducer
}

// Project selectors
export const getProjectState = createFeatureSelector<fromProject.State>('project')

export const getVideo = createSelector(
  getProjectState,
  fromProject.getVideo)

export const getVideoObjectURL = createSelector(
  getProjectState,
  fromProject.getVideoObjectURL)

export const getTimeline = createSelector(
  getProjectState,
  fromProject.getTimeline)

// Loading selectors
export const getLoadingState = createFeatureSelector<fromLoading.State>('loading')

export const getIsLoading = createSelector(
  getLoadingState,
  fromLoading.getIsAppLoading)
