import { enableProdMode, PLATFORM_PIPES } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import * as log from 'loglevel';
import { AppComponent, environment } from './app/';
import { TimePipe, UnixTimePipe } from './app/shared/time.pipes';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
// import { HTTP_PROVIDERS } from '@angular/http';

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
  log.setLevel('warn');
  enableProdMode();
}

// configure global/app providers
let providers = [
  { provide: PLATFORM_PIPES, useValue: [TimePipe, UnixTimePipe], multi:true }, // globally available pipes
  disableDeprecatedForms(), // new ng2 forms
  provideForms()
  // ,HTTP_PROVIDERS
];

// run app
bootstrap(AppComponent, providers);
