import {Action} from '@ngrx/store'

export const LOAD_PROJECT = '[Project] Load'

export class LoadProject implements Action {
  readonly type = LOAD_PROJECT
}

export type Actions = LoadProject
