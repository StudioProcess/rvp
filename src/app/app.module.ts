import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {StoreModule} from '@ngrx/store'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import {EffectsModule} from '@ngrx/effects'

import {environment} from '../environments/environment'

import {CoreModule} from './core/core.module'
import {PersistenceModule} from './persistence/persistence.module'
import {PlayerModule} from './player/player.module'

import {reducers} from './core/reducers'

import {AppContainer} from './core/containers/app'

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    PersistenceModule,
    PlayerModule,

    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([]),

    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  bootstrap: [AppContainer]
})
export class AppModule {}
