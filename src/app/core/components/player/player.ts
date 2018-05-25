import {
  Component, ViewChild, ElementRef,
  AfterViewInit, OnDestroy
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Record} from 'immutable'

import {
  Observable, Subscription, of, fromEvent,
  animationFrameScheduler as animationScheduler
} from 'rxjs'

import {
  filter, concatMap, map, take,
  debounceTime, startWith
} from 'rxjs/operators'

import * as fromProject from '../../../persistence/reducers'
import * as fromPlayer from '../../../player/reducers'
import * as player from '../../../player/actions'

import {
  _DEFAULT_PLAYER_OPTIONS_,
  _PLAYER_ASPECT_RATIO_,
  _PLAYER_RESIZE_DEBOUNCE_
} from '../../../config'

import {
  VIDEO_TYPE_BLOB, VIDEO_TYPE_URL,
  VIDEO_URL_SOURCE_YT, VIDEO_URL_SOURCE_VIMEO,
  VIDEO_URL_SOURCE_CUSTOM, UrlVideo
} from '../../../persistence/model'

@Component({
  selector: 'rv-player',
  template: `<video #video class="video-js vjs-big-play-centered"></video>`,
  styles: [`:host {display: block;}`]
})
export class PlayerContainer implements AfterViewInit, OnDestroy {
  @ViewChild('video') private readonly _videoElem: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _hostElem: ElementRef,
    private readonly _projectStore: Store<fromProject.State>,
    private readonly _store: Store<fromPlayer.State>) {}

  ngAfterViewInit() {
    const getClientRect = () => this._hostElem.nativeElement.getBoundingClientRect()

    this._store.dispatch(new player.PlayerCreate({
      elemRef: this._videoElem,
      playerOptions: _DEFAULT_PLAYER_OPTIONS_
    }))

    const setSource: Observable<{type: string, src: string}|null> = this._projectStore.select(fromProject.getProjectVideoMeta)
      .pipe(
        filter(videoMeta => videoMeta !== null),
        concatMap(videoMeta => {
        switch(videoMeta!.get('type', null)) {
          case VIDEO_TYPE_BLOB:
            return this._projectStore.select(fromProject.getProjectVideoBlob)
              .pipe(
                filter(blob => blob !== null),
                take(1),
                map(videoBlob => {
                  const objectURL = URL.createObjectURL(videoBlob)
                  return {type: 'video/mp4', src: objectURL}
                }))
          case VIDEO_TYPE_URL: {
            const urlVideo = videoMeta as Record<UrlVideo>
            switch(urlVideo.get('source', null)) {
              case VIDEO_URL_SOURCE_CUSTOM:
                return of({type: 'video/mp4', src: urlVideo.get('url', null)!.toString()})
              case VIDEO_URL_SOURCE_YT:
                return of({type: 'video/youtube', src: urlVideo.get('url', null)!.toString()})
              case VIDEO_URL_SOURCE_VIMEO:
                return of({type: 'video/vimeo', src: urlVideo.get('url', null)!.toString()})
            }
          }
        }

        return of(null)
      }))


    this._subs.push(
      setSource.subscribe((src: any) => {
        this._store.dispatch(new player.PlayerSetSource(src))
      }))

    this._subs.push(
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(_PLAYER_RESIZE_DEBOUNCE_, animationScheduler),
          map(getClientRect),
          startWith(getClientRect()))
        .subscribe(({width}) => {
          this._store.dispatch(new player.PlayerSetDimensions({
            width, height: width / _PLAYER_ASPECT_RATIO_
          }))
      }))
  }

  ngOnDestroy() {
    this._store.dispatch(new player.PlayerDestroy())

    this._subs.forEach(s => s.unsubscribe())

    this._store.dispatch(new player.PlayerDestroy())
  }
}
