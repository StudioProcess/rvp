import {OutputType} from 'jszip'
import {id} from '../lib/fp'

export const _DEFAULT_PROJECT_PATH_ = 'assets/projects/default.rv'

export interface FileMiddleware {
  postLoad(res: any): any
}

const defaultFileMW = {postLoad: id}

export interface ZipFileMeta {
  file: string
  type: OutputType
  map: string,
  middleware: FileMiddleware
}

export const _ZIP_META_: ZipFileMeta[] = [
  {
    file: 'default/project.json',
    type: 'text',
    map: 'project',
    middleware: {
      postLoad: res => JSON.parse(res)
    }
  },
  {
    file: 'default/video.m4v',
    type: 'blob',
    map: 'videoBlob',
    middleware: defaultFileMW
  }
]
