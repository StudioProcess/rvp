import {NgModule} from '@angular/core'

import {StoreModule} from '@ngrx/store'
import {EffectsModule} from '@ngrx/effects'

// import {SERVER} from './server/IServer'
import {ServerProxy} from './server/ServerProxy'
import {LFCache} from './cache/LFCache'

import {reducers} from './reducers'

@NgModule({
  imports: [
    StoreModule.forFeature('persistence', reducers),
    EffectsModule.forFeature([ServerProxy])
  ],
  providers: [
    LFCache
    /*
     * Currently, use a Proxy class, which handles the loading of a
     * default project and also handles caching via localstorage.
     * In future, when a server implementation is available,
     * just the provider needs to be adapted.
     */
    // {provide: SERVER, useClass: ServerProxy},
  ]
})
export class PersistenceModule {}
