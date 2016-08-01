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

  export(data: Project, filename?: string) {
  }

  import(filename): Project {
    return null;
  }

}
