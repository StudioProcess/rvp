import { Injectable } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import createBlobStore from './modules/blobStore';

@Injectable()
export class SimpleBackendService {

  private dataStore:LocalStorageService;
  private data;
  private blobStore;

  constructor(store: LocalStorageService) {
    this.dataStore = store;
    this.dataStore.init('rvp');
    this.data = this.dataStore.get();
    if (!this.data) {
      this.data = {};
    }
    this.blobStore = createBlobStore();
  }

  retrieveVideo() {
    return new Promise((resolve, reject) => {
      let video = this.data.video;
      if (video && video.id) {
        resolve( this.blobStore.get(video.id) );
      } else {
        reject('No video present.');
      }
    });
  }

  storeVideo(blob: Blob, meta) {
    let video = this.data.video;
    if (!video) {
      video = {};
    }

    return this.blobStore.put(blob, video.id).then((id) => {
      video.id = id;
      video.meta = meta;
      this.data.video = video;
      this.dataStore.set(this.data);
      return this.data.video;
    });
  }

  clearVideo() {
    return new Promise((resolve) => {
      let video = this.data.video;
      if (video && video.id) {
        resolve(this.blobStore.del(video.id).then(() => {
          this.data.video = null;
          this.dataStore.set(this.data);
        }));
      } else {
        this.data.video = null;
        this.dataStore.set(this.data);
        resolve();
      }
    });
  }
}
