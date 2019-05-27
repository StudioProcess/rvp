import * as JSZip from 'jszip'

import {_PROJECT_ZIP_META_} from '../../config/project'

import loadBinary from '../binary'
import {loadZip} from '../zip'

export async function extractProject(zip: JSZip): Promise<any> {
  const extractPromises = _PROJECT_ZIP_META_.map(meta => {
    return zip.file(meta.file)
      .async(meta.type, (metadata) => {
        console.log('progression: ' + metadata.percent.toFixed(2) + ' %')
      })
      .then((f:any) => [meta.middleware.postLoad(f), meta])
  })
  
  const res = await Promise.all(extractPromises)

  return res.reduce((accum: any, [file, meta]) => {
    accum[meta.map] = file
    return accum
  }, {})
}

export async function loadProject(path: string): Promise<any> {
  const bin = await loadBinary(path)
  const zip = await loadZip(bin)
  return extractProject(zip)
}
