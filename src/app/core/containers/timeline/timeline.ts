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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-timeline',
  template: `
    <div class="timeline-wrapper">
      <div #scrollbar class="scrollbar-wrapper">
        <rv-handlebar [containerRect]="scrollbarRect"></rv-handlebar>
      </div>

      <rv-track *ngFor="let track of timeline?.tracks" [data]="track" [totalDuration]="timeline.duration"></rv-track>
    </div>
  `,
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, OnDestroy, AfterViewInit {
  private readonly _subs: Subscription[] = []
  timeline: Timeline|null = null

  @ViewChild('scrollbar') scrollbar: ElementRef

  scrollbarRect = new ReplaySubject<ClientRect>(1)

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
    const getScrollbarRect = () => this.scrollbar.nativeElement.getBoundingClientRect()
    this._subs.push(fromEventPattern(this._renderer, window, 'resize')
      .map(() => getScrollbarRect())
      .startWith(getScrollbarRect())
      .subscribe(clientRect => {
        this.scrollbarRect.next(clientRect)
        this._cdr.markForCheck()
      }))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
