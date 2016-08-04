import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { Project } from '../shared/models';

@Injectable()
export class SimpleBackendService {

  private storage;

  constructor() {
    this.storage = localforage.createInstance({
      name: 'Research Video',
      storeName: 'rvp'
    });
  }

  storeVideo(blob: Blob): Promise<any> {
    if (blob.toString() != '[object Blob]') {
      blob = blob.slice();
      // log.debug('Blob object type', blob.toString());
    }
    return this.storage.setItem('video', blob).catch(err => {
      log.error(err);
      return null;
    });
  }

  retrieveVideo(): Promise<Blob> {
    return this.storage.getItem('video');
  }

  clearVideo(): Promise<any> {
    return this.storage.removeItem('video');
  }

  storeData(data: Project): Promise<any> {
    return this.storage.setItem('project', data);
  }

  retrieveData(): Promise<Project> {
    return this.storage.getItem('project');
  }

  clearData(): Promise<any> {
    return this.storage.removeItem('project');
  }

}
