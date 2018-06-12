import {Injectable} from '@angular/core'

import * as localForage from 'localforage'

import {_DEFAULT_STORAGE_CONFIG_} from '../../config/storage'

import ICache from './ICache'

/*
 * Cache implementation using LocalForage
 */
@Injectable()
export class LFCache implements ICache {
  private readonly _storage: LocalForage =
    localForage.createInstance(_DEFAULT_STORAGE_CONFIG_)

  cache<T>(key: string, data: T): Promise<T> {
    return this._storage.setItem(key, data)
  }

  clearAll(): Promise<void> {
    return this._storage.clear()
  }

  clear(key: string): Promise<void> {
    return this._storage.removeItem(key)
  }

  async isCached(keys: string[]): Promise<boolean> {
    const cachedKeys = await this._storage.keys()

    const missingKey = keys.find(k => {
      return !cachedKeys.includes(k)
    })

    return missingKey === undefined
  }

  getCached<T>(key: string): Promise<T> {
    return this._storage.getItem<T>(key)
  }
}
