export function prepareHashTagList(hashtags: Array<String>) {

  const uniq = Array.from(new Set(hashtags))
  const sorted = uniq.sort()

  return sorted
}
