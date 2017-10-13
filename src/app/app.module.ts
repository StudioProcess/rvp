import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {RouterModule} from '@angular/router';

import {StoreModule} from '@ngrx/store'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import {EffectsModule} from '@ngrx/effects'

import {environment} from '../environments/environment'

import {CoreModule} from './core/core.module'
import {PersistenceModule} from './persistence/persistence.module'
import {PlayerModule} from './player/player.module'

import {reducers} from './core/reducers'

import {AppShellContainer} from './shell'

import {appRoutes} from './routes'

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, {enableTracing: !environment.production}),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],

    CoreModule,
    PersistenceModule,
    PlayerModule
  ],
  declarations: [AppShellContainer],
  bootstrap: [AppShellContainer]
})
export class AppModule {}
