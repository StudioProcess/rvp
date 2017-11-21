import {NgModule} from '@angular/core'

import {StoreModule} from '@ngrx/store'
import {EffectsModule} from '@ngrx/effects'

import {reducers} from './reducers'
import {Player} from './Player'

@NgModule({
  imports: [
    StoreModule.forFeature('player', reducers),

    EffectsModule.forFeature([Player])
  ]
})
export class PlayerModule {}
