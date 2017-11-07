import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Renderer2, ViewChild, ElementRef,
  AfterViewInit
} from '@angular/core'

import {Store} from '@ngrx/store'

import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/do'

import * as fromProject from '../../../persistence/reducers'
import {Timeline} from '../../../persistence/model'
import {fromEventPattern} from '../../../lib/observable'
import {HandlebarComponent} from '../../components/timeline/handlebar/handlebar.component'
import {_SCROLLBAR_CAPTION_} from '../../../config/timeline/scrollbar'

export interface ScrollSettings {
  zoom: number
  scrollLeft: number
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-timeline',
  template: `
    <div class="timeline-wrapper">
      <div #scrollbar class="scrollbar-wrapper">
        <rv-handlebar #handlebar
          [containerRect]="scrollbarRect" [caption]="scrollbarCaption"
          [left]="scrollbarLeft" [width]="scrollbarWidth">
        </rv-handlebar>
      </div>

      <rv-track *ngFor="let track of timeline?.tracks"
        [data]="track" [totalDuration]="timeline.duration"
        [scrollSettings]="scrollSettings">
      </rv-track>
    </div>
  `,
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollbar') readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') readonly handlebarRef: HandlebarComponent

  timeline: Timeline|null
  scrollbarLeft = 0
  scrollbarWidth = 100
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _renderer: Renderer2,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>) {}

  ngOnInit() {
    this._subs.push(
      this._store.select(fromProject.getTimeline)
        .filter(timeline => timeline !== null)
        .subscribe(timeline => {
          this.timeline = timeline
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    const getScrollbarRect = () => {
      return this.scrollbarRef.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      fromEventPattern(this._renderer, window, 'resize')
        .map(() => getScrollbarRect())
        .startWith(getScrollbarRect())
        .subscribe(clientRect => {
          this.scrollbarRect.next(clientRect)
          this._cdr.markForCheck()
        }))


    this._subs.push(
      this.handlebarRef.handlebar.subscribe(hb => {
        // Set new left and width
        const newWidth = hb.right-hb.left
        this.scrollbarLeft = hb.left
        this.scrollbarWidth = newWidth
        this._cdr.markForCheck()
      }))

    this._subs.push(
      this.handlebarRef.handlebar.subscribe({
        next: hb => {
          // Transform values of type Handlebar
          // to value of type ScrollbarSettings
          const newWidth = hb.right-hb.left
          const zoom = 100/newWidth
          const nextVal = {zoom, scrollLeft: hb.left}
          this.scrollSettings.next(nextVal)
          this._cdr.markForCheck()
        },
        error: err => this.scrollSettings.error(err),
        complete: () => this.scrollSettings.complete()
      }))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
