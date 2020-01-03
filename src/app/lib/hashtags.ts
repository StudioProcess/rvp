export function prepareHashTagList(hashtags: Array<String>) {

  const uniq = Array.from(new Set(hashtags))
  const filtered = uniq.filter(Boolean) // remove undefined/null/true/false etc.
  const sorted = filtered.sort()

  return sorted
}
