import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromProject from './project'

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
