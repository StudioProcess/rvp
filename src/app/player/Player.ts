import {Injectable} from '@angular/core'

import {Effect, Actions} from '@ngrx/effects'

@Injectable()
export default class PlayerEffects {
  @Effect()
  createPlayer = this.actions
    .ofType<player.PlayerCreate()
}
