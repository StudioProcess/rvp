import {Action} from '@ngrx/store'

import {Record} from 'immutable'

import {Annotation} from '../model'

export const PROJECT_FETCH = '[Project] Fetch'
export const PROJECT_FETCH_SUCCESS = '[Project] Fetch Success'
export const PROJECT_FETCH_ERROR = '[Project] Fetch Error'

export const PROJECT_UPDATE = '[Project] Update'
export const PROJECT_UPDATE_SUCCESS = '[Project] Update Success'
export const PROJECT_UPDATE_ERROR = '[Project] Update Error'

export const PROJECT_UPDATE_ANNOTATION = '[Project] Update Annotation'

export const PROJECT_DELETE_TRACK = '[Project] Delete Track'

export class ProjectFetch implements Action {
  readonly type = PROJECT_FETCH
  constructor(readonly payload: {id: string}) {}
}

export class ProjectFetchSuccess implements Action {
  readonly type = PROJECT_FETCH_SUCCESS
  // TODO: adapt payload type
  constructor(readonly payload: any) {}
}

export class ProjectFetchError implements Action {
  readonly type = PROJECT_FETCH_ERROR
  constructor(readonly payload: any) {}
}

export class ProjectUpdate implements Action {
  readonly type = PROJECT_UPDATE
  constructor(readonly payload: {id: string}) {}
}

export class ProjectUpdateSuccess implements Action {
  readonly type = PROJECT_UPDATE_SUCCESS
  constructor(readonly payload: {id: string}) {}
}

export class ProjectUpdateError implements Action {
  readonly type = PROJECT_UPDATE_SUCCESS
  constructor(readonly payload: any) {}
}

export interface UpdateAnnotationPayload {
  trackIndex: number
  annotationIndex: number
  annotation: Record<Annotation>
}

export class ProjectUpdateAnnotation implements Action {
  readonly type = PROJECT_UPDATE_ANNOTATION
  constructor(readonly payload: UpdateAnnotationPayload) {}
}

export interface DeleteTrackPlayload {
  trackIndex: number
}

export class ProjectDeleteTrack implements Action {
  readonly type = PROJECT_DELETE_TRACK
  constructor(readonly payload: DeleteTrackPlayload){}
}

export type Actions =
  ProjectFetch|ProjectFetchSuccess|ProjectFetchError|
  ProjectUpdate|ProjectUpdateSuccess|ProjectUpdateError|
  ProjectUpdateAnnotation|
  ProjectDeleteTrack
