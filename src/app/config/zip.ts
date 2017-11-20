import * as JSZip from 'jszip'

export const _DEFZIPOTPIONS_: JSZip.JSZipGeneratorOptions = {
  type: 'blob',
  compression: 'DEFLATE',
  compressionOptions: {
    level: 9
  }
}
