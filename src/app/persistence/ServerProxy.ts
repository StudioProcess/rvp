import {Injectable} from '@angular/core'

import IServer from './IServer'
import LFCache from './LFCache'

@Injectable()
export class ServerProxy implements IServer {
  constructor(private readonly _cache: LFCache) {}

  fetchDefaultProject() {
    if(this._cache.)
  }
}
