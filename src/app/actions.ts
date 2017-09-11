import {Action} from '@ngrx/store'

export const HYDRATE = '[Main] HYDRATE'

export const SET_TIMELINE_DURATION = '[Main] SET_TIMELINE_DURATION'

export const UPDATE_ANNOTATION = '[Main] UPDATE_ANNOTATION'
export const ADD_ANNOTATION = '[Main] ADD_ANNOTATION'
export const SELECT_ANNOTATION = '[Main] SELECT_ANNOTATION'
export const DESELECT_ANNOTATION = '[Main] DESELECT_ANNOTATION'
export const DELETE_SELECTED_ANNOTATION = '[Main] DELETE_SELECTED_ANNOTATION'

export const ADD_TRACK = '[Main] ADD_TRACK'
export const DELETE_TRACK = '[Main] DELETE_TRACK'
export const SET_TRACK_TITLE = '[Main] SET_TRACK_TITLE'

export class Hydrate implements Action {
  readonly type = HYDRATE

  constructor(readonly payload: any) {}
}

export class SetTimelineDuration implements Action {
  readonly type = SET_TIMELINE_DURATION

  constructor(readonly payload: any) {}
}

export class UpdateAnnotation implements Action {
  readonly type = UPDATE_ANNOTATION

  constructor(readonly payload: any) {}
}

export class AddAnnotation implements Action {
  readonly type = ADD_ANNOTATION

  constructor(readonly payload: any) {}
}

export class SelectAnnotation implements Action {
  readonly type = SELECT_ANNOTATION

  constructor(readonly payload: any) {}
}

export class DeselectAnnotation implements Action {
  readonly type = DESELECT_ANNOTATION
}

export class DeleteSelectedAnnotation implements Action {
  readonly type = DELETE_SELECTED_ANNOTATION
}

export class AddTrack implements Action {
  readonly type = ADD_TRACK
}

export class DeleteTrack implements Action {
  readonly type = DELETE_TRACK

  constructor(readonly payload: any) {}
}

export class SetTrackTitle implements Action {
  readonly type = SET_TRACK_TITLE

  constructor(readonly payload: any) {}
}


export type Actions =
  Hydrate |
  SetTimelineDuration |
  UpdateAnnotation | AddAnnotation | SelectAnnotation | DeselectAnnotation | DeleteSelectedAnnotation |
  AddTrack | DeleteTrack | SetTrackTitle
