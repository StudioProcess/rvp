import {Observable} from 'rxjs/Observable'

interface ICache {
  cache<T>(key: string, data: Observable<T>): void
  isCached(key: number|string): Promise<boolean>
  getCached<T>(key: number|string): Observable<T>
}

export default ICache
