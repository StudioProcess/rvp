import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as videojs from 'video.js'
import 'videojs-vimeo'
import 'videojs-youtube'

import {
  ReplaySubject, BehaviorSubject,
  Subject, Subscription, fromEvent,
  animationFrameScheduler as animationScheduler
} from 'rxjs'

import {
  combineLatest, withLatestFrom,
  debounceTime, filter
} from 'rxjs/operators'

import {JQueryStyleEventEmitter} from 'rxjs/internal/observable/fromEvent'

import * as fromProject from '../persistence/reducers'
import * as project from '../persistence/actions/project'
import {_PLAYER_TIMEUPDATE_DEBOUNCE_} from '../config/player'

// https://github.com/videojs/video.js/blob/master/src/js/player.js
@Injectable()
export class Player implements OnDestroy {
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromProject.State>) {
      const playerSubj = new ReplaySubject<videojs.Player>(1)
      const playerPendingSubj = new BehaviorSubject<boolean>(false)
      const setCurrentTimeSubj = new Subject<number>()

      this._subs.push(
        this.createPlayer.subscribe({
          next: ({payload}) => {
            const {elemRef, playerOptions} = payload
            const playerInst: videojs.Player = videojs(elemRef.nativeElement, playerOptions)

            playerInst.on('ready', () => {
              playerSubj.next(playerInst)
            })
          },
          error: err => {
            this._store.dispatch(new project.PlayerCreateError(err))
          }
        }))

      this._subs.push(
        playerSubj.subscribe({
          next: playerInst => {
            // Player is an instance of a video.js Component class, with methods from
            // mixin class EventTarget.
            // https://github.com/videojs/video.js/blob/master/src/js/component.js#L88
            const playerEventEmitter = playerInst as JQueryStyleEventEmitter
            const playerInstSubs: Subscription[] = []
            playerInstSubs.push(
              fromEvent(playerEventEmitter, 'timeupdate')
                .pipe(
                  withLatestFrom(playerPendingSubj),
                  filter(([_, isPending]) => !isPending)
                ).subscribe(() => {
                  const currentTime = playerInst.currentTime()
                  this._store.dispatch(new project.PlayerSetCurrentTime({currentTime}))
                }))

            playerInstSubs.push(
              fromEvent(playerEventEmitter, 'durationchange').subscribe(() => {
                const duration = playerInst.duration()
                this._store.dispatch(new project.ProjectSetTimelineDuration({duration}))
              }))

            // playerInstSubs.push(
            //   Observable.fromEvent(playerEventEmitter, 'loadedmetadata').subscribe(() => {
            //     const duration = playerInst.duration()
            //     console.log(duration)
            //   }))

            playerInstSubs.push(
              fromEvent(playerEventEmitter, 'dispose').subscribe(() => {
                // On dispose clear all subs
                playerInstSubs.forEach(sub => sub.unsubscribe())
                this._store.dispatch(new project.PlayerDestroySuccess())
              }, err => {
                this._store.dispatch(new project.PlayerDestroyError(err))
              }))

            this._store.dispatch(new project.PlayerCreateSuccess())
          },
          error: err => {
            this._store.dispatch(new project.PlayerCreateError(err))
          }
        }))

      this._subs.push(
        this.setSource
          .pipe(withLatestFrom(playerSubj))
          .subscribe(([{payload}, playerInst]) => {
            playerInst.src(payload)
          }))

      this._subs.push(
        this.setDimensions.pipe(
            combineLatest(playerSubj)
          ).subscribe({
            next: ([{payload:{width, height}}, playerInst]) => {
              playerInst.width(width)
              playerInst.height(height)

              this._store.dispatch(new project.PlayerSetDimensionsSuccess({width, height}))
            },
            error: err => {
              this._store.dispatch(new project.PlayerSetDimensionsError(err))
            }
          }))

      this._subs.push(
        this.requestCurrentTime
          .subscribe(({payload: {currentTime}}) => {
            playerPendingSubj.next(true)
            setCurrentTimeSubj.next(currentTime)
          }))

      this._subs.push(
        setCurrentTimeSubj.pipe(
            debounceTime(_PLAYER_TIMEUPDATE_DEBOUNCE_, animationScheduler),
            withLatestFrom(playerSubj)
          ).subscribe(([currentTime, playerInst]) => {
            playerPendingSubj.next(false)
            playerInst.currentTime(currentTime)
          }))

      this._subs.push(
        this.destroyPlayer
          .pipe(withLatestFrom(playerSubj))
          .subscribe({
            next: ([, playerInst]) => {
              playerInst.dispose()
              this._store.dispatch(new project.PlayerDestroySuccess())
            },
            error: err => {
              this._store.dispatch(new project.PlayerDestroyError(err))
            }
          }))

      this._subs.push(
       this.togglePlaying
          .pipe(withLatestFrom(playerSubj))
          .subscribe(([, playerInst]) => {
            if(playerInst.paused()) {
              playerInst.play()
            } else {
              playerInst.pause()
            }
          }))
    }

  @Effect({dispatch: false})
  readonly createPlayer = this._actions.ofType<project.PlayerCreate>(project.PLAYER_CREATE)

  @Effect({dispatch: false})
  readonly destroyPlayer = this._actions.ofType<project.PlayerDestroy>(project.PLAYER_DESTROY)

  @Effect({dispatch: false})
  readonly setSource = this._actions.ofType<project.PlayerSetSource>(project.PLAYER_SET_SOURCE)

  @Effect({dispatch: false})
  readonly setDimensions = this._actions.ofType<project.PlayerSetDimensions>(project.PLAYER_SET_DIMENSIONS)

  @Effect({dispatch: false})
  readonly requestCurrentTime = this._actions.ofType<project.PlayerRequestCurrentTime>(project.PLAYER_REQUEST_CURRENT_TIME)

  @Effect({dispatch: false})
  readonly togglePlaying = this._actions.ofType<project.PlayerTogglePlaying>(project.PLAYER_TOGGLE_PLAYING)

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
