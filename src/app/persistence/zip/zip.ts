import * as JSZip from 'jszip'

import {Observable} from 'rxjs/Observable'

const defaultZipOptions = {
  type: 'blob',
  compression: "DEFLATE",
  compressionOptions: {
    level: 9
  }
}

export function loadZip(data: Observable<ArrayBuffer|string>) {
  return data.concatMap(d => Observable.fromPromise(JSZip.loadAsync(d)))
}

export function genZip(zip: any, options:any=defaultZipOptions) {
  return zip.generateAsync(options)
}
