import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'

import * as fromProject from '../../../persistence/reducers'

import {Timeline} from '../../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-timeline',
  template: `
    <div class="timeline-wrapper" *ngIf="timeline !== null">
      <div class="handlebar-wrapper">
      <rv-handlebar></rv-handlebar>
      </div>

      <rv-track *ngFor="let track of timeline.tracks" [data]="track" [totalDuration]="timeline.duration"></rv-track>
    </div>
  `,
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = []
  timeline: Timeline|null = null

  constructor(
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

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
