import {Action} from '@ngrx/store'

export const IO_IMPORT_PROJECT = '[IO] Import Project'
export const IO_EXPORT_PROJECT = '[IO] Export Project'

export class IOImportProject implements Action {
  readonly type = IO_IMPORT_PROJECT
}

export class IOExportProject implements Action {
  readonly type = IO_EXPORT_PROJECT
}

export type Actions = IOImportProject|IOExportProject
