import {createSelector, createFeatureSelector, ActionReducerMap} from '@ngrx/store'

import * as fromLoading from './loading'

export interface State {
  loading: fromLoading.State,
}

export const reducers: ActionReducerMap<State> = {
  loading: fromLoading.reducer
}

// Loading selectors
export const getLoadingState = createFeatureSelector<fromLoading.State>('loading')

export const getIsLoading = createSelector(
  getLoadingState,
  fromLoading.getIsAppLoading)
