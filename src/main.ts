import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// setup logging
log.enableAll();

if (environment.production) {
  log.setLevel('warn');
  enableProdMode();
}

log.debug("logging enabled"); // TODO: remove this line

platformBrowserDynamic().bootstrapModule(AppModule);
