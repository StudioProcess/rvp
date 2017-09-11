import {Action} from '@ngrx/store'

export const LOADING_START = '[Loading] Start'
export const LOADING_FINISH = '[Loading] Finish'

export class StartLoading implements Action {
  readonly type = LOADING_START
}

export class FinishLoading implements Action {
  readonly type = LOADING_FINISH
}

export type Actions = StartLoading|FinishLoading

