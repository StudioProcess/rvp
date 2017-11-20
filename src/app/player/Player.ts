import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import {JQueryStyleEventEmitter} from 'rxjs/observable/FromEventObservable'
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/debounceTime'

import {_PLAYER_TIMEUPDATE_DEBOUNCE_} from '../config'

import * as fromPlayer from './reducers'
import * as player from './actions'

// https://github.com/videojs/video.js/blob/master/src/js/player.js
@Injectable()
export default class Player implements OnDestroy {
  private readonly _subs: Subscription[] = [];

  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromPlayer.State>) {
      this._subs.push(this.init.subscribe(([playerInst, _]) => {
        // Player is an instance of a video.js Component class, with methods from
        // mixin class EventTarget.
        // https://github.com/videojs/video.js/blob/master/src/js/component.js#L88
        const playerEventEmitter = playerInst as JQueryStyleEventEmitter
        const playerInstSubs: Subscription[] = []
        playerInstSubs.push(Observable.fromEvent(playerEventEmitter, 'ready').subscribe(() => {
          playerInstSubs.push(
            Observable.fromEvent(playerEventEmitter, 'timeupdate')
              .debounceTime(_PLAYER_TIMEUPDATE_DEBOUNCE_, animationScheduler)
              .subscribe(() => {
                const currentTime = playerInst.currentTime()
                if(currentTime == null) {
                }
                this._store.dispatch(new player.PlayerSetCurrentTime({currentTime}))
              }))

          playerInstSubs.push(
            Observable.fromEvent(playerEventEmitter, 'dispose').subscribe(() => {
              // On dispose clear all subs
              playerInstSubs.forEach(sub => sub.unsubscribe())
              this._store.dispatch(new player.PlayerDestroySuccess())
            }, err => {
              this._store.dispatch(new player.PlayerDestroyError(err))
            }))
          }))
      }, _ => {
        this._store.dispatch(new player.PlayerDestroy())
      }))
    }

  @Effect({dispatch: false})
  readonly init: Observable<[videojs.Player, string]> = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .map(action => {
      const {elemRef, objectURL, playerOptions} = action.payload
      const playerInst:videojs.Player = videojs(elemRef.nativeElement, playerOptions)
      playerInst.src({src: objectURL, type: 'video/mp4'})

      const ret: [videojs.Player, string] = [playerInst, objectURL]
      return ret
    })
    .share()

  ngOnDestroy() {
    console.log('DESTROY PLAYER')
    this._subs.forEach(s => s.unsubscribe())
  }

  @Effect()
  readonly create = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .combineLatest(this.init, () => {
      return new player.PlayerCreateSuccess()
    })
    .catch(err => Observable.of(new player.PlayerCreateError(err)))

  @Effect({dispatch: false})
  readonly destroy = this._actions
    .ofType<player.PlayerDestroy>(player.PLAYER_DESTROY)
    .withLatestFrom(this.init, (_, [playerInst, objectURL]) => {
      playerInst.dispose()
      URL.revokeObjectURL(objectURL)
    })
    .catch(err => Observable.of(new player.PlayerDestroyError(err)))

  @Effect()
  readonly setDimensions = this._actions
    .ofType<player.PlayerSetDimensions>(player.PLAYER_SET_DIMENSIONS)
    .combineLatest(this.init, ({payload:{width, height}}, [playerInst, _]) => {
      playerInst.width(width)
      playerInst.height(height)

      return new player.PlayerSetDimensionsSuccess({width, height})
    })
    .catch(err => Observable.of(new player.PlayerSetDimensionsError(err)))
}
