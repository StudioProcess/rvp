import {Observable} from 'rxjs/Observable'

interface ICache {
  cache<T>(key: string, data: Observable<T>): void
  isCached(keys: Observable<string>): Observable<boolean>
  getCached<T>(key: string): Observable<T>
}

export default ICache
