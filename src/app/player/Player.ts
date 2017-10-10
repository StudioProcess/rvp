import {Injectable} from '@angular/core'

import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/share'

import * as player from './actions'

@Injectable()
export default class Player {
  constructor(private readonly _actions: Actions) {}

  @Effect({dispatch: false})
  init: Observable<[videojs.Player, string]> = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .map(action => {
      const {elemRef, objectURL, playerOptions} = action.payload
      const playerInst:videojs.Player = videojs(elemRef.nativeElement, playerOptions)
      playerInst.src({src: objectURL, type: 'video/mp4'})

      const ret: [videojs.Player, string] = [playerInst, objectURL]
      return ret
    })
    .share()

  @Effect()
  create = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .combineLatest(this.init, () => {
      return new player.PlayerCreated()
    })
    .catch(err => Observable.of(new player.PlayerCreateError(err)))

  @Effect()
  destroy = this._actions
    .ofType<player.PlayerDestroy>(player.PLAYER_DESTROY)
    .combineLatest(this.init, (_, [playerInst, objectURL]) => {
      playerInst.dispose()
      URL.revokeObjectURL(objectURL)
      return new player.PlayerDestroyed()
    })
    .catch(err => Observable.of(new player.PlayerDestroyError(err)))
}
