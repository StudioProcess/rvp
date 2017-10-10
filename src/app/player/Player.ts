import {Injectable} from '@angular/core'

import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'

import * as player from './actions'

@Injectable()
export default class Player {
  constructor(private readonly _actions: Actions) {}

  @Effect({dispatch: false})
  player: Observable<[videojs.Player, string]> = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .map(action => {
      const {elemRef, objectURL} = action.payload
      const playerInst:videojs.Player = videojs(elemRef.nativeElement)
      playerInst.src(objectURL)
      const ret: [videojs.Player, string] = [playerInst, objectURL]
      return ret
    })

  // @Effect()
  // create = this._actions
  //   .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
  //   .map(action => {

  //   })
  //   .catch(err => Observable.of(new player.PlayerCreateError(err)))

  @Effect()
  destroy = this._actions
    .ofType<player.PlayerDestroy>(player.PLAYER_DESTROY)
    .withLatestFrom(this.player)
    .map(([_, [playerInst, objectURL]]) => {
      playerInst.dispose()
      URL.revokeObjectURL(objectURL)
      return new player.PlayerDestroyed()
    })
    .catch(err => Observable.of(new player.PlayerDestroyError(err)))
}
