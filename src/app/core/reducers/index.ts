import {
  createSelector, createFeatureSelector, ActionReducerMap,
  MetaReducer
} from '@ngrx/store'

// import {storeFreeze} from 'ngrx-store-freeze'

// import {environment} from '../../../environments/environment'

import * as fromLoading from './loading'

export interface State {
  loading: fromLoading.State,
}

export const reducers: ActionReducerMap<State> = {
  loading: fromLoading.reducer
}

export const metaReducers: MetaReducer<State>[] = []
  // !environment.production ? [storeFreeze] : []

// Loading selectors
export const getLoadingState = createFeatureSelector<fromLoading.State>('loading')

export const getIsLoading = createSelector(
  getLoadingState,
  fromLoading.getIsAppLoading)
