import {OutputType} from 'jszip'
import {id} from '../lib/fp'

export const _PROJECT_AUTOSAVE_DEBOUNCE_ = 600

export const _DEFAULT_PROJECT_PATH_ = 'assets/projects/default.rv'

export const _METADATA_PATH_ = 'project.json'
export const _VIDEODATA_PATH_ = 'video.m4v'
export const _EXPORT_PROJECT_NAME_ = 'project.rv'

export interface FileMiddleware {
  postLoad(res: any): any
}

const defaultFileMW = {postLoad: id}

export interface ZipFileMeta {
  readonly file: string
  readonly type: OutputType
  readonly map: string,
  readonly middleware: FileMiddleware
}

export const _ZIP_META_: ZipFileMeta[] = [
  {
    file: _METADATA_PATH_,
    type: 'text',
    map: 'meta',
    middleware: {
      postLoad: res => JSON.parse(res)
    }
  },
  {
    file: _VIDEODATA_PATH_,
    type: 'blob',
    map: 'video',
    middleware: defaultFileMW
  }
]
