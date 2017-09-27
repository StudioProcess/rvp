import {Injectable} from '@angular/core'

import {getBinaryContent} from 'jszip-utils'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/bindNodeCallback'
import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/of'

@Injectable()
export class BinaryDataLoader {
  private readonly _getBinaryFunc = Observable.bindNodeCallback(getBinaryContent)

  load(path: Observable<string>) {
    return path.concatMap(p => this._getBinaryFunc(p))
  }
}
