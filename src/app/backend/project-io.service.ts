import { Injectable } from '@angular/core';
import { Project } from '../shared/models';

import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';

@Injectable()
export class ProjectIOService {

  constructor() {
    log.debug('filesaver', saveAs);
    log.debug('jszip', JSZip);
  }

  export(data: Project, videoBlob: Blob, filename?: string) {
    let zip = new JSZip();
    let filesaver:any = saveAs;
    zip.file('project.json', JSON.stringify(data));
    // zip.file('video.mp4', videoBlob, {binary: true});
    zip.generateAsync({type: 'blob'}).then( blob => {
      filesaver(blob, filename || 'project.rvp');
    });
  }

  import(filename): Project {
    return null;
  }

}
