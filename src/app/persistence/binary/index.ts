import {getBinaryContent} from 'jszip-utils'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/bindNodeCallback'
import 'rxjs/add/operator/concatMap'

const _getBinaryFunc = Observable.bindNodeCallback(getBinaryContent)

export default function loadBinary(path: Observable<string>) {
  debugger
  return path.concatMap(p => {
    debugger
    return _getBinaryFunc(p)
  })
}
