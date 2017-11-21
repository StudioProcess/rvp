import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
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
import 'rxjs/add/operator/catch'

import {_PLAYER_TIMEUPDATE_DEBOUNCE_} from '../config/player'

import * as fromPlayer from './reducers'
import * as player from './actions'

interface PlayerInst {
  playerInst: videojs.Player
  videoObjURL: string
}

// https://github.com/videojs/video.js/blob/master/src/js/player.js
@Injectable()
export default class Player implements OnDestroy {
  private readonly _subs: Subscription[] = [];

  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromPlayer.State>) {
      const playerSubj = new ReplaySubject<PlayerInst>(1)

      this._subs.push(
        this.createPlayer.subscribe({
          next: ({payload}) => {
            const {elemRef, objectURL, playerOptions} = payload
            const playerInst: videojs.Player = videojs(elemRef.nativeElement, playerOptions)
            playerInst.src({src: objectURL, type: 'video/mp4'})

            playerInst.on('ready', () => {
              playerSubj.next({
                playerInst,
                videoObjURL: objectURL
              })
            })
          },
          error: err =>{
            this._store.dispatch(new player.PlayerCreateError(err))
          }
        }))

      this._subs.push(
        playerSubj.subscribe({
          next: ({playerInst}) => {
            // Player is an instance of a video.js Component class, with methods from
            // mixin class EventTarget.
            // https://github.com/videojs/video.js/blob/master/src/js/component.js#L88
            const playerEventEmitter = playerInst as JQueryStyleEventEmitter
            const playerInstSubs: Subscription[] = []
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

            this._store.dispatch(new player.PlayerCreateSuccess())
          },
          error: err => {
            this._store.dispatch(new player.PlayerCreateError(err))
          }
        }))

      this._subs.push(
        this.destroyPlayer.withLatestFrom(playerSubj).subscribe({
          next: ([, {playerInst, videoObjURL}]) => {
            playerInst.dispose()
            URL.revokeObjectURL(videoObjURL)
          },
          error: err => {
            this._store.dispatch(new player.PlayerDestroyError(err))
          }
        }))
    }

  @Effect({dispatch: false})
  readonly createPlayer = this._actions.ofType<player.PlayerCreate>(player.PLAYER_CREATE)

  @Effect({dispatch: false})
  readonly destroyPlayer = this._actions.ofType<player.PlayerDestroy>(player.PLAYER_DESTROY)

  ngOnDestroy() {
    console.log('DESTROY PLAYER')
    this._subs.forEach(s => s.unsubscribe())
  }
}
