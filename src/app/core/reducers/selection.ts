import {Set, Record} from 'immutable'

import {Annotation} from '../../persistence/model'

import * as selection from '../actions/selection'

interface Selection {
  annotations: Set<Record<Annotation>>
}

const SelectionRecordFactory = Record<Selection>({annotations: Set()})

const initialState = new SelectionRecordFactory()

export type State = Record<Selection>

export function reducer(state: State=initialState, action: selection.Actions): State {
  switch(action.type) {
    case selection.SELECTION_SELECT_ANNOTATION: {
      return state.update('annotations', annotations => {
        return annotations.add(action.payload.annotation)
      })
    }
    case selection.SELECTION_DESELECT_ANNOTATION: {
      return state.update('annotations', annotations => {
        return annotations.delete(action.payload.annotation)
      })
    }
    default: {
      return state
    }
  }
}
