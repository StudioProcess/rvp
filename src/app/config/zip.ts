import * as JSZip from 'jszip'

export const _ZIP_DEFAULT_OTPIONS_: JSZip.JSZipGeneratorOptions = {
  type: 'blob',
  compression: 'DEFLATE',
  compressionOptions: {
    level: 9
  }
}
