import {Action} from '@ngrx/store'

export const PLAYER_CREATE = '[Player] Create'
export const PLAYER_DESTROY = '[Player] Destroy'

export class PlayerCreate implements Action {
  readonly type = PLAYER_CREATE
  constructor(readonly playload: any) {}
}

export class PlayerDestroy implements Action {
  readonly type = PLAYER_DESTROY
  constructor() {}
}

export type PlayerActions = PlayerCreate|PlayerDestroy
