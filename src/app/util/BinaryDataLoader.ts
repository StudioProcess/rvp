import {Injectable} from '@angular/core'

import {getBinaryContent} from 'jszip-utils'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/bindCallback'
import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/of'

@Injectable()
export class BinaryDataLoader {
  private readonly _getBinaryFunc =
    Observable.bindCallback(getBinaryContent, (err: Error, data: string|ArrayBuffer) => {
      return err ? Observable.throw(err) : Observable.of(data)
    })

  load(paths: Observable<string>) {
    return paths.concatMap(path => {
      return this._getBinaryFunc(path)
    })
  }
}
