import {
  Component, ViewChild, ElementRef,
  Input, AfterViewInit, OnDestroy
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'

import * as fromPlayer from '../../player/reducers'
import * as player from '../../player/actions'

import {_DEFAULT_PLAYER_OPTIONS_} from '../../config'

@Component({
  selector: 'rv-player',
  template:
    `<div class="video-area">
      <video #video class="video-js video-file vjs-big-play-centered"></video>
    </div>`
})
export class PlayerContainer implements AfterViewInit, OnDestroy {
  private readonly _subs: Subscription[] = []

  @ViewChild('video') private readonly _videoElem: ElementRef;

  @Input() rvVideoObjectURL: Observable<string>

  constructor(private readonly _store: Store<fromPlayer.State>) {}

  ngAfterViewInit() {
    this._subs.push(this.rvVideoObjectURL.subscribe(videoObjURL => {
      const playerPayload = {
        elemRef: this._videoElem,
        objectURL: videoObjURL,
        playerOptions: _DEFAULT_PLAYER_OPTIONS_
      }

      this._store.dispatch(new player.PlayerCreate(playerPayload))
    }))
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())

    this._store.dispatch(new player.PlayerDestroy())
  }
}
