import {Injectable} from '@angular/core'

import {BinaryDataLoader} from './BinaryDataLoader'
import {ZipHandler} from './ZipHandler'

import {Observable} from 'rxjs/Observable'

@Injectable()
export class ProjectLoader {
  constructor(
    private readonly _binLoader: BinaryDataLoader,
    private readonly _zipHandler: ZipHandler) {}

  load(path: Observable<string>) {
    return this._zipHandler.unzip(this._binLoader.load(path))
  }

  save() {

  }
}
