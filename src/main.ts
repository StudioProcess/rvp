import {enableProdMode} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

import {AppModule} from './app/app.module'
import {environment} from './environments/environment'

if (environment.production) {
  enableProdMode()

  // Add service worker
  if('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(err => {
        console.error(err)
      })
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
