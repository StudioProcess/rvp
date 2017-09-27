import {OutputType} from 'jszip'

export const _DEFAULT_PROJECT_PATH_ = 'assets/projects/default.rv'

export interface ZipFileMeta {
  file: string
  type: OutputType
  map: string
}

export const _ZIP_META_: ZipFileMeta[] = [
  {file: 'default/project.json', type: 'text', map: 'timeline'},
  {file: 'default/video.m4v', type: 'blob', map: 'video'}
]
