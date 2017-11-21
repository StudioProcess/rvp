import {OutputType} from 'jszip'
import {id} from '../lib/fp'

export const _DEFAULT_PROJECT_PATH_ = 'assets/projects/initial.rv'

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
    file: 'initial/meta.json',
    type: 'text',
    map: 'meta',
    middleware: {
      postLoad: res => JSON.parse(res)
    }
  },
  {
    file: 'initial/video.m4v',
    type: 'blob',
    map: 'video',
    middleware: defaultFileMW
  }
]
