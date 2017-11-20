import {Action} from '@ngrx/store'

export const IO_EXPORT_PROJECT = '[IO] Export Project'

export class IOExportProject implements Action {
  readonly type = IO_EXPORT_PROJECT
}

export type Actions = IOExportProject
