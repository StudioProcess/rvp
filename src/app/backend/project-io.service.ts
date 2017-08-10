import { Injectable } from '@angular/core';
import { Project } from '../shared/models';

import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';

// interface ProjectData {
//   data: Project;
//   videoBlob: Blob;
// }

@Injectable()
export class ProjectIOService {

  constructor() {}

  export(data: Project, videoBlob: Blob, filename?: string): Promise<any> {
    let zip = new JSZip();
    let filesaver:any = saveAs;
    zip.file('project.json', JSON.stringify(data));
    if (videoBlob) zip.file('video.m4v', videoBlob, {binary: true});
    return zip.generateAsync({type: 'blob'}).then( blob => {
      filesaver(blob, filename || 'project.rv');
    });
  }

  import(zipfile: File): Promise<any> {
    let zip = new JSZip();
    return zip.loadAsync(zipfile).then(zip => {
      let projectFile = zip.file('project.json');
      let videoBlob = zip.file('video.m4v');
      log.debug('unzipping', projectFile, videoBlob);

      let dataPromise = projectFile ?
        projectFile.async('string').then(json => {
          return JSON.parse(json);
        }) : Promise.resolve(null);

      let videoBlobPromise = videoBlob ?
        videoBlob.async('uint8array').then(uint8array => {
          return new Blob([uint8array]);
        }) : Promise.resolve(null);

      return Promise.all([dataPromise, videoBlobPromise]).then( ([data, videoBlob]) => {
        return { data, videoBlob };
      });
    });
  }

}
