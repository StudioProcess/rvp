import {NgModule} from '@angular/core'

import {SERVER} from './server/IServer'
import ServerProxy from './proxy/ServerProxy'
import LFCache from './cache/LFCache'
import DefaultProject from './proxy/DefaultProject'

@NgModule({
  providers: [
    LFCache,
    DefaultProject,
    /*
     * Currently, use a Proxy class, which handles the loading of a
     * default project and also handles caching via localstorage.
     * In future, when a server implementation is available,
     * just the provider needs to be adapted.
     */
    {provide: SERVER, useClass: ServerProxy},
  ]
})
export class PersistenceModule {}
