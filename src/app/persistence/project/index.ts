import * as JSZip from 'jszip'

import {_PROJECT_ZIP_META_} from '../../config/project'

import loadBinary from '../binary'
import {loadZip} from '../zip'
import {MessageService} from '../../core/actions/message.service'

export async function extractProject(zip: JSZip, msg?: MessageService): Promise<any> {

  //const progressModalBar = (<HTMLInputElement> document.getElementById('progress-modal-bar'))
  //const progressModalText = (<HTMLInputElement> document.getElementById('progress-modal-text'))

  const extractPromises = _PROJECT_ZIP_META_.map(meta => {
    return zip.file(meta.file)
      .async(meta.type, (metadata) => {
        if(meta.type === 'blob') {
          let percent = metadata.percent.toFixed(2)
          msg!.update({
            percent: percent,
            text: 'importing '+ meta.file +': '+ percent +'%'
          })
          //progressModalBar.value = metadata.percent.toFixed(0)
          //progressModalText.innerText = 'importing '+ meta.file +': '+ metadata.percent.toFixed(2) +'%'
          //console.log('progression: ' + metadata.percent.toFixed(0) + ' %')
        }
      })
      .then((f:any) => {
        msg!.update({
          text: 'please wait'
        })
        //progressModalText.innerText = 'please wait'
        return [meta.middleware.postLoad(f), meta]})
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
  return extractProject(zip, undefined)
}
