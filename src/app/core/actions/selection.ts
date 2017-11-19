import {Action} from '@ngrx/store'

import {Record} from 'immutable'

import {Annotation} from '../../persistence/model'

export const SELECTION_SELECT_ANNOTATION = '[Selection] Select Annotation'
export const SELECTION_DESELECT_ANNOTATION = '[Selection] Deselect Annotation'

export class SelectAnnotationPayload {
  readonly annotation: Record<Annotation>
}

export class SelectionSelectAnnotation implements Action {
  readonly type = SELECTION_SELECT_ANNOTATION
  constructor(readonly payload: SelectAnnotationPayload) {}
}

export class SelectionDeselectAnnotation implements Action {
  readonly type = SELECTION_DESELECT_ANNOTATION
  constructor(readonly  payload: SelectAnnotationPayload) {}
}

export type Actions =
  SelectionSelectAnnotation|SelectionDeselectAnnotation
