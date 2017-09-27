import * as JSZip from 'jszip'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/concatMap'

import {_DEFZIPOTPIONS_} from '../../config'

export function loadZip(data: Observable<ArrayBuffer|string>) {
  return data.concatMap(d => Observable.fromPromise(JSZip.loadAsync(d)))
}

export function genZip(zip: any, options:any=_DEFZIPOTPIONS_) {
  return zip.generateAsync(options)
}
