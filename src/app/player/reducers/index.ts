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
export const getPlayerState = createFeatureSelector<State>('player')

const getStatusState = createSelector(getPlayerState, (state: State) => state.state)

export const getIsPaused = createSelector(
  getStatusState, fromPlayer.getIsPaused)

export const getCurrentTime = createSelector(
  getStatusState, fromPlayer.getCurrentTime)

export const getDimensions = createSelector(
  getStatusState, fromPlayer.getDimensions)
