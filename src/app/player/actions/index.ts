import {ElementRef} from '@angular/core'

import {Action} from '@ngrx/store'

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_DESTROY = '[Player] Destroy'
export const PLAYER_CREATE_ERROR = '[Player] Create Error'

interface PlayerCreatePayload {
  elemRef: ElementRef
  objectURL: string
}

export class PlayerCreate implements Action {
  readonly type = PLAYER_CREATE
  constructor(readonly playload: PlayerCreatePayload) {}
}

export class PlayerDestroy implements Action {
  readonly type = PLAYER_DESTROY
}

export class PlayerCreateError implements Action {
  readonly type = PLAYER_CREATE_ERROR
  constructor(readonly payload: any) {}
}

export type PlayerActions = PlayerCreate|PlayerDestroy|PlayerCreateError
