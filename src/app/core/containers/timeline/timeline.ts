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

import {Record} from 'immutable'

import * as fromProject from '../../../persistence/reducers'
import * as project from '../../../persistence/actions/project'
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
    <div #scrollbar class="scrollbar-wrapper">
      <rv-handlebar #handlebar
        [containerRect]="scrollbarRect" [caption]="scrollbarCaption"
        [left]="scrollbarLeft" [width]="scrollbarWidth">
      </rv-handlebar>
    </div>

    <rv-track *ngFor="let track of timeline?.tracks; index as i; trackBy: trackByFunc;"
      [data]="track" [trackIndex]="i" [totalDuration]="timeline.duration"
      [scrollSettings]="scrollSettings"
      (deleteTrack)="deleteTrack($event)"
      (updateAnnotation)="updateAnnotation($event)">
    </rv-track>
  `,
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollbar') readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') readonly handlebarRef: HandlebarComponent

  timeline: Record<Timeline>
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
          this.timeline = timeline as Record<Timeline> // use identifer! syntax?
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
        .subscribe(this.scrollbarRect))

    this._subs.push(
      this.handlebarRef.handlebar.subscribe(hb => {
        // Set new left and width
        const newWidth = hb.right-hb.left
        this.scrollbarLeft = hb.left
        this.scrollbarWidth = newWidth
        this._cdr.markForCheck()
      }))

    const initHB = {
      left: this.scrollbarLeft,
      right: this.scrollbarWidth
    }

    this._subs.push(
      this.handlebarRef.handlebar.startWith(initHB).subscribe({
        next: hb => {
          // Transform values of type Handlebar
          // to values of type ScrollbarSettings
          const newWidth = hb.right-hb.left
          const zoom = 100/newWidth
          const nextVal = {zoom, scrollLeft: hb.left}
          this.scrollSettings.next(nextVal)
          // this._cdr.markForCheck()
        },
        error: err => this.scrollSettings.error(err),
        complete: () => this.scrollSettings.complete()
      }))
  }

  trackByFunc(index: number) {
    return index
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  deleteTrack(deleteTrack: project.DeleteTrackPlayload) {
    this._store.dispatch(new project.ProjectDeleteTrack(deleteTrack))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
