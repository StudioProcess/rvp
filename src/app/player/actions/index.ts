import {ElementRef} from '@angular/core'

import {PlayerOptions} from 'video.js'

import {Action} from '@ngrx/store'

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_CREATED = '[Player] Created'
export const PLAYER_CREATE_ERROR = '[Player] Create Error'

export const PLAYER_DESTROY = '[Player] Destroy'
export const PLAYER_DESTROY_ERROR = '[Player] Destroy Error'
export const PLAYER_DESTROYED = '[Player] Destroyed'

export const PLAYER_SET_CURRENT_TIME = '[Player] Set Current Time'

export const PLAYER_SET_DIMENSIONS = '[Player] Set Dimensions'

interface PlayerCreatePayload {
  elemRef: ElementRef
  objectURL: string,
  playerOptions: PlayerOptions
}

export class PlayerCreate implements Action {
  readonly type = PLAYER_CREATE
  constructor(readonly payload: PlayerCreatePayload) {}
}

export class PlayerCreateError implements Action {
  readonly type = PLAYER_CREATE_ERROR
  constructor(readonly payload: any) {}
}

export class PlayerCreated implements Action {
  readonly type = PLAYER_CREATED
  // constructor(readonly playload: any) {}
}

export class PlayerDestroy implements Action {
  readonly type = PLAYER_DESTROY
}

export class PlayerDestroyError implements Action {
  readonly type = PLAYER_DESTROY_ERROR
  constructor(readonly playload: any) {}
}

export class PlayerDestroyed implements Action {
  readonly type = PLAYER_DESTROYED
}

export class PlayerSetCurrentTime implements Action {
  readonly type = PLAYER_SET_CURRENT_TIME
  constructor(readonly payload: {currentTime:number}) {}
}

export class PlayerSetDimensions implements Action {
  readonly type = PLAYER_SET_DIMENSIONS
  constructor(readonly payload: {width: number, height:number }) {}
}

export type PlayerActions =
  PlayerCreate|PlayerCreateError|PlayerCreated|
  PlayerDestroy|PlayerDestroyError|PlayerDestroyed|
  PlayerSetCurrentTime|
  PlayerSetDimensions
