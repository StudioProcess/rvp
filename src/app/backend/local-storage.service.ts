import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

  private storeName:string;

  init(storeName:string) {
    this.storeName = storeName;
  }

  // get data() {
  //   return JSON.parse( localStorage.getItem(this.storeName) );
  // }
  //
  // set data(data:any) {
  //   localStorage.setItem( this.storeName, JSON.stringify(data) );
  // }

  get() {
    return JSON.parse( localStorage.getItem(this.storeName) );
  }

  set(data) {
    localStorage.setItem( this.storeName, JSON.stringify(data) );
  }

  clear() {
    localStorage.removeItem( this.storeName );
  }

}
