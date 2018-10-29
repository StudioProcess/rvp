import {ElementRef} from '@angular/core'
import {Action} from '@ngrx/store'

import {PlayerOptions} from 'video.js'
import {Record} from 'immutable'

import {
  Annotation, AnnotationSelection,
  Track, ProjectSnapshot,
  VideoType, VideoUrlSource
} from '../model'

export const PROJECT_LOAD = '[Project] Load'
export const PROJECT_LOAD_SUCCESS = '[Project] Load Success'
export const PROJECT_LOAD_ERROR = '[Project] Load Error'

export const PROJECT_IMPORT = '[Project] Import'
export const PROJECT_IMPORT_ERROR = '[Project] Import Error'

export const PROJECT_EXPORT = '[Project] Export'
export const PROJECT_EXPORT_ERROR = '[Project] Export Error'

export const PROJECT_EXPORT_AS_TEXT = '[Project] Export as Text'

export const PROJECT_IMPORT_VIDEO = '[Project] Import Video'
export const PROJECT_IMPORT_VIDEO_SUCCESS = '[Project] Import Video Success'
export const PROJECT_IMPORT_VIDEO_ERROR = '[Project] Import Video'

export const PROJECT_RESET = '[Project] Reset'
export const PROJECT_RESET_ERROR = '[Project] Reset Error'

export const PROJECT_ADD_ANNOTATION = '[Project] Add Annotation'
export const PROJECT_UPDATE_ANNOTATION = '[Project] Update Annotation'
export const PROJECT_DELETE_SELECTED_ANNOTATIONS = '[Project] Delete Selected Annotations'
export const PROJECT_SELECT_ANNOTATION = '[Project] Selection Annotation'
export const PROJECT_SELECTION_RESETALL_ANNOTATION = '[Project] Reset Annotation Selection'
export const PROJECT_COPY_ANNOTATION_SELECTION_TO_CLIPBOARD = '[Project] Copy Annotation Selection to Clipboard'
export const PROJECT_PASTE_CLIPBOARD = '[Project] Paste Annotation Selection form Clipboard'

export const PROJECT_ADD_TRACK = '[Project] Add Track'
export const PROJECT_UPDATE_TRACK = '[Project] Update Track'
export const PROJECT_DELETE_TRACK = '[Project] Delete Track'
export const PROJECT_DUPLICATE_TRACK = '[Project] Duplicate Track'
export const PROJECT_INSERTAT_TRACK = '[Project] Move Insert At Track'

export const PROJECT_SET_TIMELINE_DURATION = '[Project] Set Timeline Duration'

export const PROJECT_PUSH_UNDO = '[Project] Push Undo'
export const PROJECT_UNDO = '[Project] Undo'
export const PROJECT_REDO = '[Project] Redo'

export const PROJECT_SETTINGS_SET_SHOW_CURRENT_ANNOTATIONS_ONLY = '[PROJECT] Set Current Annotations Only Setting'
export const PROJECT_SETTINGS_SET_SEARCH = '[PROJECT] Set Search Setting'
export const PROJECT_SETTINGS_SET_APPLY_TO_TIMELINE = '[PROJECT] Apply To Timeline Setting'

export const PROJECT_SET_ACTIVE_TRACK = '[PROJECT] Set Active Track'

export const PROJECT_FOCUS_ANNOTATION = '[PROJECT] Focus Annotation'

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

export class ProjectImport implements Action {
  readonly type = PROJECT_IMPORT
  constructor(readonly payload: File) {}
}

export class ProjectImportError implements Action {
  readonly type = PROJECT_IMPORT_ERROR
  constructor(readonly payload: any) {}
}

export class ProjectExport implements Action {
  readonly type = PROJECT_EXPORT
}

export class ProjectExportError implements Action {
  readonly type = PROJECT_EXPORT_ERROR
  constructor(readonly payload: any) {}
}

export class ProjectExportAsText implements Action {
  readonly type = PROJECT_EXPORT_AS_TEXT
  constructor(readonly payload: any) {}
}

export interface ImportVideoPayload {
  readonly type: VideoType
  readonly source?: VideoUrlSource
  readonly data: File|Blob|URL
}

export class ProjectImportVideo implements Action {
  readonly type = PROJECT_IMPORT_VIDEO
  constructor(readonly payload: ImportVideoPayload) {}
}

export class ProjectImportVideoSuccess implements Action {
  readonly type = PROJECT_IMPORT_VIDEO_SUCCESS
  constructor(readonly payload: ImportVideoPayload) {}
}

export class ProjectImportVideoError implements Action {
  readonly type = PROJECT_IMPORT_VIDEO_ERROR
  constructor(readonly payload: any) {}
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
  readonly annotationStackIndex: number
  readonly annotation: Record<Annotation>
  readonly source: 'toolbar'|'timeline'
}

export class ProjectAddAnnotation implements Action {
  readonly type = PROJECT_ADD_ANNOTATION
  constructor(readonly payload: AddAnnotationPayload) {}
}

export interface UpdateAnnotationPayload {
  readonly trackIndex: number
  readonly annotationIndex: number
  readonly annotationStackIndex: number
  readonly annotation: Record<Annotation>
}

export class ProjectUpdateAnnotation implements Action {
  readonly type = PROJECT_UPDATE_ANNOTATION
  constructor(readonly payload: UpdateAnnotationPayload) {}
}

export class ProjectDeleteSelectedAnnotations implements Action {
  readonly type = PROJECT_DELETE_SELECTED_ANNOTATIONS
}

export const enum AnnotationSelectionType {
  Default,
  Pick,
  Range
}

export interface SelectAnnotationPayload {
  readonly type: AnnotationSelectionType,
  readonly selection: Record<AnnotationSelection>
}

export class ProjectSelectAnnotation implements Action {
  readonly type = PROJECT_SELECT_ANNOTATION
  constructor(readonly payload: SelectAnnotationPayload) {}
}

export class ProjectResetAnnotationSelection implements Action {
  readonly type = PROJECT_SELECTION_RESETALL_ANNOTATION
}

export class ProjectCopyAnnotationSelectionToClipboard implements Action {
  readonly type = PROJECT_COPY_ANNOTATION_SELECTION_TO_CLIPBOARD
}

export class ProjectPasteClipBoard implements Action {
  readonly type = PROJECT_PASTE_CLIPBOARD
  constructor() {}
}

type AddTrackPayload = Partial<Track>

export class ProjectAddTrack implements Action {
  readonly type = PROJECT_ADD_TRACK
  constructor(readonly payload: AddTrackPayload) {}
}

export interface UpdateTrackPayload {
  readonly trackIndex: number
  readonly track: Record<Track>
}

export class ProjectUpdateTrack implements Action {
  readonly type = PROJECT_UPDATE_TRACK
  constructor(readonly payload: UpdateTrackPayload) {}
}

export interface DeleteTrackPlayload {
  readonly trackIndex: number
}

export class ProjectDeleteTrack implements Action {
  readonly type = PROJECT_DELETE_TRACK
  constructor(readonly payload: DeleteTrackPlayload) {}
}

export interface DuplicateTrackPayload {
  readonly trackIndex: number
}

export class ProjectDuplicateTrack implements Action {
  readonly type = PROJECT_DUPLICATE_TRACK
  constructor(readonly payload: DuplicateTrackPayload) {}
}

export interface TrackInsertAtPayload {
  readonly currentTrackIndex: number
  readonly insertAtIndex: number
}

export class ProjectInsertAtTrack implements Action {
  readonly type = PROJECT_INSERTAT_TRACK
  constructor(readonly payload: TrackInsertAtPayload) {}
}

export class ProjectSetTimelineDuration implements Action {
  readonly type = PROJECT_SET_TIMELINE_DURATION
  constructor(readonly payload: {duration: number}) {}
}

export class ProjectPushUndo implements Action {
  readonly type = PROJECT_PUSH_UNDO
  constructor(readonly payload: Record<ProjectSnapshot>) {}
}

export class ProjectUndo implements Action {
  readonly type = PROJECT_UNDO
}

export class ProjectRedo implements Action {
  readonly type = PROJECT_REDO
}

export class ProjectSettingsSetCurrentAnnotationsOnly implements Action {
  readonly type = PROJECT_SETTINGS_SET_SHOW_CURRENT_ANNOTATIONS_ONLY
  constructor(readonly payload: boolean) {}
}

export class ProjectSettingsSetSearch implements Action {
  readonly type = PROJECT_SETTINGS_SET_SEARCH
  constructor(readonly payload: string|null) {}
}

export class ProjectSettingsSetApplyToTimeline implements Action {
  readonly type = PROJECT_SETTINGS_SET_APPLY_TO_TIMELINE
  constructor(readonly payload: boolean) {}
}

export interface ProjectSetActiveTrackPayload {
  readonly trackIndex: number
}

export class ProjectSetActiveTrack implements Action {
  readonly type = PROJECT_SET_ACTIVE_TRACK
  constructor(readonly payload: ProjectSetActiveTrackPayload) {}
}

export interface ProjectFocusAnnotationPayload {
  readonly annotation: Record<Annotation>
}

export class ProjectFocusAnnotation implements Action {
  readonly type = PROJECT_FOCUS_ANNOTATION
  constructor(readonly payload: ProjectFocusAnnotationPayload) {}
}

/**
 * PLAYER
 */

interface PlayerCreatePayload {
  readonly elemRef: ElementRef
  readonly playerOptions: PlayerOptions
}

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_CREATE_SUCCESS = '[Player] Create Success'
export const PLAYER_CREATE_ERROR = '[Player] Create Error'

export const PLAYER_DESTROY = '[Player] Destroy'
export const PLAYER_DESTROY_SUCCESS = '[Player] Destroy Success'
export const PLAYER_DESTROY_ERROR = '[Player] Destroy Error'

export const PLAYER_SET_SOURCE = '[Player] Set Source'

export const PLAYER_SET_CURRENT_TIME = '[Player] Set Current Time'
export const PLAYER_REQUEST_CURRENT_TIME = '[Player] Request Current Time'

export const PLAYER_SET_DIMENSIONS = '[Player] Set Dimensions'
export const PLAYER_SET_DIMENSIONS_SUCCESS = '[Player] Set Dimensions Success'
export const PLAYER_SET_DIMENSIONS_ERROR = '[Player] Set Dimensions Error'

export const PLAYER_TOGGLE_PLAYING = '[Player] Toggle Playing'

export class PlayerCreate implements Action {
  readonly type = PLAYER_CREATE
  constructor(readonly payload: PlayerCreatePayload) {}
}

export class PlayerCreateSuccess implements Action {
  readonly type = PLAYER_CREATE_SUCCESS
  // constructor(readonly playload: any) {}
}

export class PlayerCreateError implements Action {
  readonly type = PLAYER_CREATE_ERROR
  constructor(readonly payload: any) {}
}

export class PlayerDestroy implements Action {
  readonly type = PLAYER_DESTROY
}

export class PlayerDestroySuccess implements Action {
  readonly type = PLAYER_DESTROY_SUCCESS
}

export class PlayerDestroyError implements Action {
  readonly type = PLAYER_DESTROY_ERROR
  constructor(readonly playload: any) {}
}

export class PlayerSetSource implements Action {
  readonly type = PLAYER_SET_SOURCE
  constructor(readonly payload: {type: string, src: string}) {}
}

// Player state
export class PlayerSetCurrentTime implements Action {
  readonly type = PLAYER_SET_CURRENT_TIME
  constructor(readonly payload: {currentTime:number}) {}
}

export class PlayerRequestCurrentTime implements Action {
  readonly type = PLAYER_REQUEST_CURRENT_TIME
  constructor(readonly payload: {currentTime:number}) {}
}

// Player dimensions
interface PlayerDimensionsPayload {
  readonly width: number
  readonly height:number
}

export class PlayerSetDimensions implements Action {
  readonly type = PLAYER_SET_DIMENSIONS
  constructor(readonly payload: PlayerDimensionsPayload) {}
}

export class PlayerSetDimensionsSuccess implements Action {
  readonly type = PLAYER_SET_DIMENSIONS_SUCCESS
  constructor(readonly payload: PlayerDimensionsPayload) {}
}

export class PlayerSetDimensionsError implements Action {
  readonly type = PLAYER_SET_DIMENSIONS_ERROR
  constructor(readonly payload: any) {}
}

export class PlayerTogglePlaying implements Action {
  readonly type = PLAYER_TOGGLE_PLAYING
}

export type Actions =
  ProjectLoad|ProjectLoadSuccess|ProjectLoadError|
  ProjectImport|
  ProjectImportVideo|ProjectImportVideoSuccess|ProjectImportVideoError|
  ProjectExport|ProjectExportError|
  ProjectReset|
  ProjectAddTrack|ProjectUpdateTrack|ProjectDeleteTrack|ProjectDuplicateTrack|ProjectInsertAtTrack|
  ProjectAddAnnotation|ProjectUpdateAnnotation|ProjectFocusAnnotation|
  ProjectDeleteSelectedAnnotations|ProjectSelectAnnotation|
  ProjectResetAnnotationSelection|ProjectCopyAnnotationSelectionToClipboard|ProjectPasteClipBoard|
  ProjectSetTimelineDuration|
  ProjectPushUndo|ProjectUndo|ProjectRedo|
  ProjectSettingsSetCurrentAnnotationsOnly|ProjectSettingsSetSearch|ProjectSettingsSetApplyToTimeline|
  ProjectSetActiveTrack|
  // PLAYER ACTIONS
  PlayerCreate|PlayerCreateError|PlayerCreateSuccess|
  PlayerDestroy|PlayerDestroyError|PlayerDestroySuccess|
  PlayerSetDimensions|PlayerSetDimensionsSuccess|PlayerSetDimensionsError|
  PlayerSetSource|
  PlayerSetCurrentTime|
  PlayerTogglePlaying
