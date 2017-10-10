import {ElementRef} from '@angular/core'

import {Action} from '@ngrx/store'

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_CREATE_ERROR = '[Player] Create Error'

export const PLAYER_DESTROY = '[Player] Destroy'
export const PLAYER_DESTROY_ERROR = '[Player] Destroy Error'
export const PLAYER_DESTROYED = '[Player] Destroyed'

interface PlayerCreatePayload {
  elemRef: ElementRef
  objectURL: string
}

export class PlayerCreate implements Action {
  readonly type = PLAYER_CREATE
  constructor(readonly payload: PlayerCreatePayload) {}
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

export class PlayerCreateError implements Action {
  readonly type = PLAYER_CREATE_ERROR
  constructor(readonly payload: any) {}
}

export type PlayerActions =
  PlayerCreate|PlayerCreateError|
  PlayerDestroy|PlayerDestroyError|PlayerDestroyed
