import {Action} from '@ngrx/store'

import {Record} from 'immutable'

import {AnnotationSelection} from '../reducers/selection'

export const SELECTION_SELECT_ANNOTATION = '[Selection] Select Annotation'
export const SELECTION_DESELECT_ANNOTATION = '[Selection] Deselect Annotation'
export const SELECTION_RESET_ANNOTATION = '[Selection] Reset Annotation'

export interface SelectionAnnotationPayload {
  readonly selection: Record<AnnotationSelection>
}

export class SelectionSelectAnnotation implements Action {
  readonly type = SELECTION_SELECT_ANNOTATION
  constructor(readonly payload: SelectionAnnotationPayload) {}
}

export class SelectionDeselectAnnotation implements Action {
  readonly type = SELECTION_DESELECT_ANNOTATION
  constructor(readonly payload: SelectionAnnotationPayload) {}
}

export class SelectionResetAnnotation implements Action {
  readonly type = SELECTION_RESET_ANNOTATION
}

export type Actions =
  SelectionSelectAnnotation|SelectionDeselectAnnotation|SelectionResetAnnotation
