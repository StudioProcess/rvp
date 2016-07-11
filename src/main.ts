import { enableProdMode, PLATFORM_PIPES } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import * as log from 'loglevel';
import { AppComponent, environment } from './app/';
import { TimePipe } from './app/shared/time.pipe';

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

// configure global/app providers
let providers = [
  { provide: PLATFORM_PIPES, useValue: [TimePipe], multi:true } // globally available pipes
];

// run app
bootstrap(AppComponent, providers);
