import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import * as log from 'loglevel';
import { AppComponent, environment } from './app/';

// setup global logger
log.enableAll();
window['log'] = log;
if (console) {
  console.trace = log.trace;
  console.log = log.debug;
  console.dir = log.debug;
  console.debug = log.debug;
  console.info = log.info;
  console.warn = log.warn;
  console.error = log.error;
}

// setup production environment
if (environment.production) {
  log.setLevel('error');
  enableProdMode();
}

// run app
bootstrap(AppComponent);
