import {
  createSelector, createFeatureSelector, ActionReducerMap,
  MetaReducer
} from '@ngrx/store'

// import {storeFreeze} from 'ngrx-store-freeze'

// import {environment} from '../../../environments/environment'

import * as fromLoading from './loading'
import * as fromSelection from './selection'

export interface State {
  readonly loading: fromLoading.State,
  readonly selection: fromSelection.State
}

export const reducers: ActionReducerMap<State> = {
  loading: fromLoading.reducer,
  selection: fromSelection.reducer
}

export const metaReducers: MetaReducer<State>[] = []
  // !environment.production ? [storeFreeze] : []

// Loading selectors
export const getLoadingState = createFeatureSelector<fromLoading.State>('loading')
export const getSelectionState = createFeatureSelector<fromSelection.State>('selection')

export const getIsLoading = createSelector(
  getLoadingState,
  fromLoading.getIsAppLoading)

export const getSelectedAnnotations = createSelector(getSelectionState, fromSelection.getSelectedAnnotations)

export const getAnnotationSelection = createSelector(getSelectedAnnotations, annotations => {
  return annotations.first()
})
