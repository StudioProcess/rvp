import {Action} from '@ngrx/store'

import {Record} from 'immutable'

import {Annotation, Track} from '../model'

export const PROJECT_LOAD = '[Project] Load'
export const PROJECT_LOAD_SUCCESS = '[Project] Load Success'
export const PROJECT_LOAD_ERROR = '[Project] Load Error'

export const PROJECT_EXPORT = '[Project] Export'
export const PROJECT_EXPORT_ERROR = '[Project] Export Error'

export const PROJECT_RESET = '[Project] Reset'
export const PROJECT_RESET_ERROR = '[Project] Reset Error'

export const PROJECT_ADD_ANNOTATION = '[Project] Add Annotation'
export const PROJECT_UPDATE_ANNOTATION = '[Project] Update Annotation'
export const PROJECT_DELETE_ANNOTATION = '[Project] Delete Annotation'

export const PROJECT_ADD_TRACK = '[Project] Add Track'
export const PROJECT_DELETE_TRACK = '[Project] Delete Track'

export class ProjectLoad implements Action {
  readonly type = PROJECT_LOAD
}

export class ProjectLoadSuccess implements Action {
  readonly type = PROJECT_LOAD_SUCCESS
  // TODO: adapt payload type
  constructor(readonly payload: any) {}
}

export class ProjectLoadError implements Action {
  readonly type = PROJECT_LOAD_ERROR
  constructor(readonly payload: any) {}
}

export class ProjectExport implements Action {
  readonly type = PROJECT_EXPORT
}

export class ProjectExportError implements Action {
  readonly type = PROJECT_EXPORT_ERROR
  constructor(readonly payload: any){}
}

export class ProjectReset implements Action {
  readonly type = PROJECT_RESET
}

export class ProjectResetError implements Action {
  readonly type = PROJECT_RESET_ERROR
  constructor(readonly payload: any) {}
}

export interface AddAnnotationPayload {
  readonly trackIndex: number
  readonly annotation: Record<Annotation>
}

export class ProjectAddAnnotation implements Action {
  readonly type = PROJECT_ADD_ANNOTATION
  constructor(readonly payload: AddAnnotationPayload) {}
}

export interface UpdateAnnotationPayload {
  readonly trackIndex: number
  readonly annotationIndex: number
  readonly annotation: Record<Annotation>
}

export class ProjectUpdateAnnotation implements Action {
  readonly type = PROJECT_UPDATE_ANNOTATION
  constructor(readonly payload: UpdateAnnotationPayload) {}
}

export interface DeleteAnnotationPayload {
  readonly trackIndex: number
  readonly annotationIndex: number
  readonly annotation: Record<Annotation>
}

export class ProjectDeleteAnnotation implements Action {
  readonly type = PROJECT_DELETE_ANNOTATION
  constructor(readonly payload: DeleteAnnotationPayload) {}
}

type AddTrackPayload = Partial<Track>

export class ProjectAddTrack implements Action {
  readonly type = PROJECT_ADD_TRACK
  constructor(readonly payload: AddTrackPayload) {}
}

export interface DeleteTrackPlayload {
  readonly trackIndex: number
}

export class ProjectDeleteTrack implements Action {
  readonly type = PROJECT_DELETE_TRACK
  constructor(readonly payload: DeleteTrackPlayload){}
}

export type Actions =
  ProjectLoad|ProjectLoadSuccess|ProjectLoadError|
  ProjectExport|ProjectExportError|
  ProjectReset|
  ProjectAddTrack|ProjectDeleteTrack|
  ProjectAddAnnotation|ProjectUpdateAnnotation|ProjectDeleteAnnotation
