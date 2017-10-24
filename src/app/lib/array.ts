export interface ArrayPartitionResult<T> {
  before: T[]
  elem: T|null
  after: T[]
}

export function getPartitionResult<T>(arr: T[], sliceIndex: number): ArrayPartitionResult<T> {
  if(sliceIndex >= 0 && sliceIndex < (arr.length-1)) {
    return {
      before: arr.slice(0, sliceIndex),
      elem: arr[sliceIndex],
      after: arr.slice(sliceIndex+1)
    }
  } else {
    return {
      before: [],
      elem: null,
      after: []
    }
  }
}
