export function sortAnnotationsFunc(a1: any, a2: any) {
  const a1Start = a1.utc_timestamp
  const a2Start = a2.utc_timestamp
  if(a1Start < a2Start) {
    return -1
  } else if(a1Start > a2Start) {
    return 1
  } else {
    return 0
  }
}
