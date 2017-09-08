import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { Project } from '../shared/models';

@Injectable()
export class SimpleBackendService {
  private readonly storage: LocalForage =
    localforage.createInstance({
      name: 'Research Video',
      storeName: 'rvp'
    })

  storeVideo(blob: Blob): Promise<Blob> {
    if (blob.toString() != '[object Blob]') {
      blob = blob.slice();
      // log.debug('Blob object type', blob.toString());
    }
    return this.storage.setItem('video', blob)
  }

  retrieveVideo(): Promise<Blob> {
    return this.storage.getItem('video');
  }

  clearVideo(): Promise<void> {
    return this.storage.removeItem('video');
  }

  hasVideo(): Promise<boolean> {
    return this._hasKey('video');
  }

  storeData(data: Project): Promise<any> {
    return this.storage.setItem('project', data);
  }

  retrieveData(): Promise<Project> {
    return this.storage.getItem('project');
  }

  clearData(): Promise<void> {
    return this.storage.removeItem('project');
  }

  hasData(): Promise<boolean> {
    return this._hasKey('project');
  }

  // check if a key is present in localforage
  private async _hasKey(key: string) {
    const keys = await this.storage.keys()
    return keys.includes(key)
  }
}
