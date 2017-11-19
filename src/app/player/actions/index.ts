import {ElementRef} from '@angular/core'

import {PlayerOptions} from 'video.js'

import {Action} from '@ngrx/store'

interface PlayerCreatePayload {
  readonly elemRef: ElementRef
  readonly objectURL: string,
  readonly playerOptions: PlayerOptions
}

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_CREATE_SUCCESS = '[Player] Create Success'
export const PLAYER_CREATE_ERROR = '[Player] Create Error'

export const PLAYER_DESTROY = '[Player] Destroy'
export const PLAYER_DESTROY_SUCCESS = '[Player] Destroy Success'
export const PLAYER_DESTROY_ERROR = '[Player] Destroy Error'

export const PLAYER_SET_CURRENT_TIME = '[Player] Set Current Time'

export const PLAYER_SET_DIMENSIONS = '[Player] Set Dimensions'
export const PLAYER_SET_DIMENSIONS_SUCCESS = '[Player] Set Dimensions Success'
export const PLAYER_SET_DIMENSIONS_ERROR = '[Player] Set Dimensions Error'

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

// Player state
export class PlayerSetCurrentTime implements Action {
  readonly type = PLAYER_SET_CURRENT_TIME
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

export type PlayerActions =
  PlayerCreate|PlayerCreateError|PlayerCreateSuccess|
  PlayerDestroy|PlayerDestroyError|PlayerDestroySuccess|
  PlayerSetDimensions|PlayerSetDimensionsSuccess|PlayerSetDimensionsError|
  PlayerSetCurrentTime
