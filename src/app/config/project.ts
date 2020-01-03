import {OutputType} from 'jszip'
import {id} from '../lib/fp'

export const _PROJECT_AUTOSAVE_DEBOUNCE_ = 1000

export const _PROJECT_DEFAULT_TITLE_ = 'Untitled document'
export const _PROJECT_TITLE_MAX_LENGTH_ = 50
export const _PROJECT_DEFAULT_PATH_ = 'assets/projects/default.rv'

export const _PROJECT_METADATA_PATH_ = 'project.json'
export const _PROJECT_VIDEODATA_PATH_ = 'video.m4v'
//export const _PROJECT_EXPORT_NAME_ = 'project.rv'

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

export const _PROJECT_ZIP_META_: ZipFileMeta[] = [
  {
    file: _PROJECT_METADATA_PATH_,
    type: 'text',
    map: 'meta',
    middleware: {
      postLoad: res => JSON.parse(res)
    }
  },
  {
    file: _PROJECT_VIDEODATA_PATH_,
    type: 'blob',
    map: 'video',
    middleware: defaultFileMW
  }
]

export const _EMPTY_PROJECT_ = {
  meta: {
    "id": 0,
    "timeline": {
      "id": 0,
      "general": {
        "title" : _PROJECT_DEFAULT_TITLE_
      },
      "duration": 60,
      "hashtags": {
        "list": []
      },
      "tracks": [
        {
          "id": 0,
          "color": "#ff0000",
          "fields": {
            "title": "(Track 1)"
          },
          "annotationStacks": [
            []
          ]
        }
      ]
    },
    "video": null
  },
  video: null
}
