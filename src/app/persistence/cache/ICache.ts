interface ICache {
  cache<T>(key: string, data: T): Promise<T>
  isCached(key: number|string): Promise<boolean>
  getCached<T>(key: number|string): Promise<T>
}

export default ICache
