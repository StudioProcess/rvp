import {
  createSelector, createFeatureSelector, ActionReducerMap,
  MetaReducer
} from '@ngrx/store'

// import {storeFreeze} from 'ngrx-store-freeze'
// import {environment} from '../../../environments/environment'

import * as fromSelection from './selection'

export interface State {
  readonly selection: fromSelection.State
}

export const reducers: ActionReducerMap<State> = {
  selection: fromSelection.reducer
}

export const metaReducers: MetaReducer<State>[] = []
  // !environment.production ? [storeFreeze] : []

export const getSelectionState = createFeatureSelector<fromSelection.State>('selection')

export const getSelectedAnnotations = createSelector(getSelectionState, fromSelection.getSelectedAnnotations)

export const getAnnotationSelection = createSelector(getSelectedAnnotations, annotations => {
  return annotations.first()
})
