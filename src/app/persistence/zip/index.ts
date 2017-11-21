import * as JSZip from 'jszip'

export function loadZip(data: ArrayBuffer|Blob|string): Promise<JSZip> {
  return JSZip.loadAsync(data)
}

