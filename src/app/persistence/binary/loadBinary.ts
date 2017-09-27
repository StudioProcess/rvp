import {getBinaryContent} from 'jszip-utils'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/bindNodeCallback'

const _getBinaryFunc = Observable.bindNodeCallback(getBinaryContent)

export default function loadBinary(path: Observable<string>) {
  return path.concatMap(p => _getBinaryFunc(p))
}
