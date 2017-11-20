import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Renderer2, ViewChild, ElementRef,
  AfterViewInit
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'

import {Record} from 'immutable'

import * as fromSelection from '../../reducers'
import * as fromProject from '../../../persistence/reducers'
import * as project from '../../../persistence/actions/project'
import * as selection from '../../actions/selection'
import {Timeline, Track} from '../../../persistence/model'
import {fromEventPattern} from '../../../lib/observable'
import {HandlebarComponent} from '../../components/timeline/handlebar/handlebar.component'
import {_SCROLLBAR_CAPTION_} from '../../../config/timeline/scrollbar'
import {rndColor} from '../../../lib/color'

export interface ScrollSettings {
  readonly zoom: number
  readonly scrollLeft: number
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-timeline',
  templateUrl: 'timeline.html',
  styleUrls: ['timeline.scss']
})
export class TimelineContainer implements OnInit, AfterViewInit, OnDestroy {
  timeline: Record<Timeline>
  selectedAnnotationId: number|null
  scrollLeft = 0
  zoom = 1
  scrollbarLeft = 0
  scrollbarWidth = 100
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)
  readonly zoomContainerRect = new ReplaySubject<ClientRect>(1)

  @ViewChild('scrollbar') private readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') private readonly handlebarRef: HandlebarComponent
  @ViewChild('zoomContainer') private readonly zoomContainerRef: ElementRef
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

    this._subs.push(
      this._store.select(fromSelection.getAnnotationSelection)
        .subscribe(annotationSelection => {
          if(annotationSelection !== undefined) {
            this.selectedAnnotationId = annotationSelection.getIn(['annotation', 'id'])
          } else {
            this.selectedAnnotationId = null
          }
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    const getScrollbarRect = () => {
      return this.scrollbarRef.nativeElement.getBoundingClientRect()
    }

    const getZoomContainerRect = () => {
      return this.zoomContainerRef.nativeElement.getBoundingClientRect()
    }

    const winResize = fromEventPattern(this._renderer, window, 'resize')

    this._subs.push(
      winResize
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

    const scrollSetting = this.handlebarRef.handlebar.startWith(initHB)
      .map(hb => {
        const newWidth = hb.right-hb.left
        const zoom = 100/newWidth

        return {zoom, scrollLeft: hb.left}
      })

    this._subs.push(
      Observable.merge(winResize, scrollSetting).subscribe({
        next: () => {
          this.zoomContainerRect.next(getZoomContainerRect())
        },
        error: err => this.zoomContainerRect.error(err),
        complete: () => this.zoomContainerRect.complete()
      }))

    this._subs.push(
      Observable.combineLatest(
        this.zoomContainerRect, scrollSetting,
        (rect, {zoom, scrollLeft}) => {
          return {zoom, left: (rect.width/100)*scrollLeft}
        }).subscribe(({zoom, left}) => {
          this.zoom = zoom
          this.scrollLeft = left
          this._cdr.markForCheck()
        }))
  }

  trackByFunc(_: number, track: Record<Track>) {
    return track.get('id', null)
  }

  addAnnotation(addAnnotation: project.AddAnnotationPayload) {
    this._store.dispatch(new project.ProjectAddAnnotation(addAnnotation))
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  selectAnnotation(annotation: selection.SelectionAnnotationPayload) {
    this._store.dispatch(new selection.SelectionResetAnnotation())
    this._store.dispatch(new selection.SelectionSelectAnnotation(annotation))
  }

  addTrack() {
    this._store.dispatch(new project.ProjectAddTrack({color: rndColor()}))
  }

  deleteTrack(deleteTrack: project.DeleteTrackPlayload) {
    this._store.dispatch(new project.ProjectDeleteTrack(deleteTrack))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
