import { Injectable } from '@angular/core';
import { localforage } from 'localforage';
import { Project } from '../shared/models';

@Injectable()
export class SimpleBackendService {

  private storage: LocalForage;

  constructor() {
    this.storage = localforage.createInstance( {name:'rvp'} );
  }

  storeVideo(blob: Blob): Promise<any> {
    return this.storage.setItem('video', blob);
  }

  retrieveVideo(): Promise<Blob> {
    return this.storage.getItem('video');
  }

  clearVideo(): Promise<any> {
    return this.storage.clear();
  }

  storeData(data: Project): Promise<any> {
    return this.storage.setItem('project', data);
  }

  retrieveData(): Promise<Project> {
    return this.storage.getItem('project');
  }

  clearData(): Promise<any> {
    return this.storage.clear();
  }

}
