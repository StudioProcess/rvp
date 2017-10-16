import {
  Component, ViewChild, ElementRef,
  AfterViewInit, OnDestroy
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/filter'

import * as fromProject from '../../persistence/reducers'
import * as fromPlayer from '../../player/reducers'
import * as player from '../../player/actions'

import {_DEFAULT_PLAYER_OPTIONS_} from '../../config'

@Component({
  selector: 'rv-player',
  template:
    `<div>
      <video #video class="video-js vjs-big-play-centered"></video>
    </div>`
})
export class PlayerContainer implements AfterViewInit, OnDestroy {
  @ViewChild('video') private readonly _videoElem: ElementRef;

  private readonly _subs: Subscription[] = []

  private readonly videoObjectURL: Observable<string> =
    this._projectStore.select(fromProject.getVideoObjectURL)
      .filter(objUrl => objUrl !== null) as Observable<string>

  constructor(
    private readonly _projectStore: Store<fromProject.State>,
    private readonly _store: Store<fromPlayer.State>) {}

  ngAfterViewInit() {
    this._subs.push(this.videoObjectURL.subscribe(videoObjURL => {
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
