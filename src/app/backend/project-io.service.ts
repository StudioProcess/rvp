import { Injectable } from '@angular/core';
import { Project } from '../shared/models';

import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';

@Injectable()
export class ProjectIOService {

  constructor() {
    // log.debug('filesaver', saveAs);
    // log.debug('jszip', JSZip);
  }

  export(data: Project, videoBlob: Blob, filename?: string): Promise<any> {
    let zip = new JSZip();
    let filesaver:any = saveAs;
    zip.file('project.json', JSON.stringify(data));
    // zip.file('video.mp4', videoBlob, {binary: true});
    return zip.generateAsync({type: 'blob'}).then( blob => {
      filesaver(blob, filename || 'project.rv');
    });
  }

  import(zipfile: File): Promise<any> {
    let zip = new JSZip();
    return zip.loadAsync(zipfile).then(zip => {

      let dataPromise = zip.file('project.json').async('string').then(json => {
        return JSON.parse(json);
      });
      let videoBlobPromise = zip.file('video.mp4').async('uint8array').then(uint8array => {
        return new Blob([uint8array]);
      });
      return Promise.all([dataPromise, videoBlobPromise]).then( ([data, videoBlob]) => {
        return {data, videoBlob};
      });

    });
  }

}
