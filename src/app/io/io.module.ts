import {NgModule} from '@angular/core'

import {EffectsModule} from '@ngrx/effects'

import {IOEffects} from './io'

@NgModule({
  imports: [
    EffectsModule.forFeature([IOEffects])
  ]
})
export class IOModule {
  //loadProject

  //exportProject
}
