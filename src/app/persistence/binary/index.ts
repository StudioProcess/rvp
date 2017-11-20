import {getBinaryContent} from 'jszip-utils'

export default function loadBinary(path: string): Promise<string|ArrayBuffer> {
  return new Promise((resolve, reject) => {
    getBinaryContent(path, (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
