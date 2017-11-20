import * as JSZip from 'jszip'

export function loadZip(data: ArrayBuffer|string): Promise<JSZip> {
  return JSZip.loadAsync(data)
}

