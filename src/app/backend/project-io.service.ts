import { Injectable } from '@angular/core';
import { Project } from '../shared/models';

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

// interface ProjectData {
//   data: Project;
//   videoBlob: Blob;
// }

@Injectable()
export class ProjectIOService {
  export(data: Project, videoBlob: Blob, filename?: string): Promise<any> {
    let zip = new JSZip();
    zip.file('project.json', JSON.stringify(data));
    if (videoBlob) zip.file('video.m4v', videoBlob, {binary: true});
    return zip.generateAsync({type: 'blob'}).then((blob: any) => {
      saveAs(blob, filename || 'project.rv');
    });
  }

  import(zipfile: File): Promise<any> {
    let zip = new JSZip();
    return zip.loadAsync(zipfile).then((zip: any) => {
      let projectFile = zip.file('project.json');
      let videoBlob = zip.file('video.m4v');
      log.debug('unzipping', projectFile, videoBlob);

      let dataPromise = projectFile ?
        projectFile.async('string').then((json: any) => {
          return JSON.parse(json);
        }) : Promise.resolve(null);

      let videoBlobPromise = videoBlob ?
        videoBlob.async('uint8array').then((uint8array: any) => {
          return new Blob([uint8array]);
        }) : Promise.resolve(null);

      return Promise.all([dataPromise, videoBlobPromise]).then( ([data, videoBlob]) => {
        return { data, videoBlob };
      });
    });
  }

}
