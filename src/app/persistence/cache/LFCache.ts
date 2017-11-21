import {Injectable} from '@angular/core'

import * as localForage from 'localforage'

import {_DEFAULT_STORAGE_CONFIG_} from '../../config'

import ICache from './ICache'

/*
 * Cache implementation using LocalForage
 */
@Injectable()
export default class LFCache implements ICache {
  private readonly storage: LocalForage =
    localForage.createInstance(_DEFAULT_STORAGE_CONFIG_)

  cache<T>(key: string, data: T): Promise<T> {
    return this.storage.setItem(key, data)
  }

  async isCached(keys: string[]): Promise<boolean> {
    const cachedKeys = await this.storage.keys()

    const missingKey = keys.find(k => {
      return !cachedKeys.includes(k)
    })

    return missingKey === undefined
  }

  getCached<T>(key: string): Promise<T> {
    return this.storage.getItem<T>(key)
  }
}
