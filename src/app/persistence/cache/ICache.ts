import {Observable} from 'rxjs/Observable'

interface ICache {
  cache<T>(key: string, data: Observable<T>): void
  isCached(keys: Observable<number|string>): Observable<boolean>
  getCached<T>(key: number|string): Observable<T>
}

export default ICache
