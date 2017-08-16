import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// setup logging
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

if (environment.production) {
  log.setLevel('warn');
  enableProdMode();
}

log.debug("logging enabled"); // TODO: remove this line

platformBrowserDynamic().bootstrapModule(AppModule);
