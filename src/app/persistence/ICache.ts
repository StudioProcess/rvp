export default interface ICache {
  cache<T>(id: keyof T, data: T): void
  isCached<T>(id: keyof T): T
}
