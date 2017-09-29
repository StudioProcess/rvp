import {ActionReducerMap, createSelector, createFeatureSelector} from '@ngrx/store'

import * as fromPlayer from './player'
import * as fromOptions from './options'

export interface State {
  state: fromPlayer.State,
  options: fromOptions.State
}

export const reducers: ActionReducerMap<State> = {
  state: fromPlayer.reducer,
  options: fromOptions.reducer
}

// Player state selectors
export const getPlayerState = createFeatureSelector<fromPlayer.State>('state')

export const getIsPaused = createSelector(
  getPlayerState, fromPlayer.getIsPaused)

export const getCurrentTime = createSelector(
  getPlayerState, fromPlayer.getCurrentTime)
