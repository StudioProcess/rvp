import {Injectable} from '@angular/core'

import * as localForage from 'localforage'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/concatMap'

import {_DEFAULT_STORAGE_CONFIG_} from '../../config'

import ICache from './ICache'

/*
 * Cache implementation using LocalForage
 */
@Injectable()
export default class LFCache implements ICache {
  // TODO: retrieve instance config from configuration
  private readonly storage: LocalForage =
    localForage.createInstance(_DEFAULT_STORAGE_CONFIG_)

  cache<T>(key: string, data: Observable<T>): Observable<T> {
    return data.concatMap(d => {
      return Observable.fromPromise(
        this.storage.setItem(key, d))
    })
  }

  isCached(keys: Observable<string>): Observable<boolean> {
    return keys.concatMap((key: string) => {
      return Observable.fromPromise(
        this.storage.keys().then(res => res.includes(key)))
    })
  }

  getCached<T>(key: string): Observable<T> {
    return Observable.fromPromise(this.storage.getItem(key))
  }
}
