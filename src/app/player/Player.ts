import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
import {JQueryStyleEventEmitter} from 'rxjs/observable/FromEventObservable'
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/debounceTime'

import {_PLAYER_TIMEUPDATE_DEBOUNCE_} from '../config/player'

import * as fromPlayer from './reducers'
import * as player from './actions'
import * as project from '../persistence/actions/project'

// https://github.com/videojs/video.js/blob/master/src/js/player.js
@Injectable()
export default class Player implements OnDestroy {
  private readonly _subs: Subscription[] = [];

  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromPlayer.State>) {
      const playerSubj = new ReplaySubject<videojs.Player>(1)

      this._subs.push(
        this.createPlayer.subscribe({
          next: ({payload}) => {
            const {elemRef, playerOptions} = payload
            const playerInst: videojs.Player = videojs(elemRef.nativeElement, playerOptions)

            playerInst.on('ready', () => {
              playerSubj.next(playerInst)
            })
          },
          error: err =>{
            this._store.dispatch(new player.PlayerCreateError(err))
          }
        }))

      this._subs.push(
        playerSubj.subscribe({
          next: (playerInst) => {
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
                  this._store.dispatch(new player.PlayerSetCurrentTime({currentTime}))
                }))

            playerInstSubs.push(
              Observable.fromEvent(playerEventEmitter, 'durationchange').subscribe(() => {
                const duration = playerInst.duration()
                this._store.dispatch(new project.ProjectSetTimelineDuration({duration}))
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
        this.setSource
          .withLatestFrom(playerSubj)
          .subscribe(([{payload}, playerInst]) => {
            const objectURL = URL.createObjectURL(payload)
            playerInst.src({src: objectURL, type: 'video/mp4'})
          }))

      this._subs.push(
        this.setDimensions
          .combineLatest(playerSubj)
          .subscribe({
            next: ([{payload:{width, height}}, playerInst]) => {
              playerInst.width(width)
              playerInst.height(height)

              this._store.dispatch(new player.PlayerSetDimensionsSuccess({width, height}))
            },
            error: err => {
              this._store.dispatch(new player.PlayerSetDimensionsError(err))
            }
          }))

      this._subs.push(
        this.requestCurrentTime
          .withLatestFrom(playerSubj)
          .subscribe(([{payload:{currentTime}}, playerInst]) => {
            playerInst.currentTime(currentTime)
          }))

      this._subs.push(
        this.destroyPlayer.withLatestFrom(playerSubj).subscribe({
          next: ([, playerInst]) => {
            playerInst.dispose()
            this._store.dispatch(new player.PlayerDestroySuccess())
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

  @Effect({dispatch: false})
  readonly setSource = this._actions.ofType<player.PlayerSetSource>(player.PLAYER_SET_SOURCE)

  @Effect({dispatch: false})
  readonly setDimensions = this._actions.ofType<player.PlayerSetDimensions>(player.PLAYER_SET_DIMENSIONS)

  @Effect({dispatch: false})
  readonly requestCurrentTime = this._actions.ofType<player.PlayerRequestCurrentTime>(player.PLAYER_REQUEST_CURRENT_TIME)

  ngOnDestroy() {
    console.log('DESTROY PLAYER')
    this._subs.forEach(s => s.unsubscribe())
  }
}
