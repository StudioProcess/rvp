import { Injectable } from '@angular/core';

import createPM from './modules/pm25';
import createBlobStore from './modules/blobStore';

@Injectable()
export class BackendService {
  blobStore:any;
  pm:any;

  constructor() {
    this.blobStore = createBlobStore({});
    this.pm = createPM();
    this.pm.init();
  }

}
