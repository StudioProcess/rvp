import {Injectable, OnInit, OnDestroy} from '@angular/core'

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

import {_TIMEUPDATE_DEBOUNCE_} from '../config'

import * as fromPlayer from './reducers'
import * as player from './actions'

// https://github.com/videojs/video.js/blob/master/src/js/player.js
@Injectable()
export default class Player implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = [];

  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromPlayer.State>) {}

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

  ngOnInit() {
    this._subs.push(this.init.subscribe(([playerInst, _]) => {
      // Player is an instance of a video.js Component class, with methods from
      // mixin class EventTarget.
      // https://github.com/videojs/video.js/blob/master/src/js/component.js#L88
      const playerEventEmitter = playerInst as JQueryStyleEventEmitter
      const playerInstSubs: Subscription[] = []

      playerInstSubs.push(Observable.fromEvent(playerEventEmitter, 'ready').subscribe(() => {
        console.log('PLAYER READY')
        playerInstSubs.push(
          Observable.fromEvent(playerEventEmitter, 'timeupdate')
            .debounceTime(_TIMEUPDATE_DEBOUNCE_, animationScheduler)
            .subscribe(() => {
              const currentTime = playerInst.currentTime()
              if(currentTime == null) {
                debugger
              }
              console.log('CURRENT TIME' + currentTime)
              this._store.dispatch(new player.PlayerSetCurrentTime({currentTime}))
            }))

        playerInstSubs.push(
          Observable.fromEvent(playerEventEmitter, 'dispose').subscribe(() => {
            // On dispose clear all subs
            playerInstSubs.forEach(sub => sub.unsubscribe())
            this._store.dispatch(new player.PlayerDestroyed())
          }, err => {
            this._store.dispatch(new player.PlayerDestroyError(err))
          }))
        }))
    }, _ => {
      this._store.dispatch(new player.PlayerDestroy())
    }))
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }

  @Effect()
  create = this._actions
    .ofType<player.PlayerCreate>(player.PLAYER_CREATE)
    .combineLatest(this.init, () => {
      return new player.PlayerCreated()
    })
    .catch(err => Observable.of(new player.PlayerCreateError(err)))

  @Effect({dispatch: false})
  destroy = this._actions
    .ofType<player.PlayerDestroy>(player.PLAYER_DESTROY)
    .withLatestFrom(this.init, (_, [playerInst, objectURL]) => {
      playerInst.dispose()
      URL.revokeObjectURL(objectURL)
    })
    .catch(err => Observable.of(new player.PlayerDestroyError(err)))
}
