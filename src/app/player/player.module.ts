import {NgModule} from '@angular/core'

import {EffectsModule} from '@ngrx/effects'

import {Player} from './Player'

@NgModule({
  imports: [
    EffectsModule.forFeature([Player])
  ]
})
export class PlayerModule {}
