import {Observable} from 'rxjs/Observable'

import * as fromProject from '../../core/reducers/project'
// import {_DEFAULT_FILES_IN_ZIP_} from '../../config'
import {_ZIP_META_} from '../../config'

import loadBinary from '../binary'
import {loadZip} from '../zip'


export function extractProject(zip: Observable<any>):Observable<fromProject.State> {
  return zip.concatMap(z => {
    const extractPromises = _ZIP_META_.map(meta => {
      return z.file(meta.file).async(meta.type).then((f:any) => [f, meta])
    })

    return Observable.fromPromise(Promise.all(extractPromises))
  }).map(res => {
    return res.reduce((accum, [file, meta]) => {
      accum[meta.map] = file
      return accum
    }, {})
  })
}

export function loadProject(path: Observable<string>): Observable<fromProject.State> {
  return extractProject(loadZip(loadBinary(path)))
}

export function saveProject() {
}
