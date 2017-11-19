import {Set, Record} from 'immutable'

import {Annotation, AnnotationRecordFactory} from '../../persistence/model'

import * as selection from '../actions/selection'

export const enum SelectionSource {
  None,
  Timeline,
  Inspector
}

export interface AnnotationSelection {
  readonly annotation: Record<Annotation>
  readonly source: SelectionSource
}

export const AnnotationSelectionFactory = Record<AnnotationSelection>({
  annotation: new AnnotationRecordFactory(),
  source: SelectionSource.None
})

interface Selection {
  readonly annotations: Set<Record<AnnotationSelection>>
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
    case selection.SELECTION_RESET_ANNOTATION: {
      return state.set('annotations', Set())
    }
    default: {
      return state
    }
  }
}

export const getSelectedAnnotations = (state: State) => state.get('annotations', null)
