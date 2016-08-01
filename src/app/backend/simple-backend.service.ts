import { Injectable } from '@angular/core';
import { localforage } from 'localforage';

@Injectable()
export class SimpleBackendService {

  private dataStore;
  private blobStore;

  constructor() {
    this.blobStore = localforage.createInstance( {name:'blobs'} );
    this.dataStore = localforage.createInstance( {name:'data'} );
  }

  storeVideo(blob: Blob) {
  }

  retrieveVideo() {
  }

  clearVideo() {
  }

  storeData() {
  }

  retrieveData() {
  }

  clearData() {
  }
}
