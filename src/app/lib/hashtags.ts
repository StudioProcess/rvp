
export function prepareHashTagList(hashtags: []) {
  
  const uniq = Array.from(new Set(hashtags))
  const sorted = uniq.sort()

  return sorted
}
