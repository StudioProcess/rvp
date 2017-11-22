import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Renderer2, ViewChild, ElementRef,
  AfterViewInit, Inject
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Store} from '@ngrx/store'

import {Record} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'

import * as fromSelection from '../../reducers'
import * as fromProject from '../../../persistence/reducers'
import * as fromPlayer from '../../../player/reducers'
import * as project from '../../../persistence/actions/project'
import * as selection from '../../actions/selection'
import * as player from '../../../player/actions'
import {Timeline, Track} from '../../../persistence/model'
import {fromEventPattern} from '../../../lib/observable'
import {HandlebarComponent} from '../../components/timeline/handlebar/handlebar.component'
import {_SCROLLBAR_CAPTION_} from '../../../config/timeline/scrollbar'
import {rndColor} from '../../../lib/color'
import {coordTransform} from '../../../lib/coords'

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
  playerPos = 0
  playerCurrentTime = 0
  scrollbarLeft = 0
  scrollbarWidth = 100
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)
  readonly zoomContainerRect = new ReplaySubject<ClientRect>(1)

  @ViewChild('scrollbar') private readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') private readonly handlebarRef: HandlebarComponent
  @ViewChild('zoomContainer') private readonly zoomContainerRef: ElementRef
  @ViewChild('timelineOverflow') private readonly timelineOverflowRef: ElementRef
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _renderer: Renderer2,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngOnInit() {
    const timeline = this._store.select(fromProject.getProjectTimeline)
      .filter(timeline => timeline !== null)
      .share()

    this._subs.push(
      timeline
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

    this._subs.push(
      this._store.select(fromPlayer.getCurrentTime).withLatestFrom(timeline, (currentTime, timeline) => {
        const totalTime = timeline!.get('duration', null)
        return {
          currentTime,
          totalTime,
          progress: currentTime/totalTime
        }
      }).subscribe(({progress, currentTime}) => {
        this.playerPos = progress*100
        this.playerCurrentTime = currentTime
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
      this.handlebarRef.onHandlebarUpdate.subscribe(hb => {
        // Set new left and width
        this.scrollbarLeft = hb.left
        this.scrollbarWidth = hb.width
        this._cdr.markForCheck()
      }))

    const initHB = {
      left: this.scrollbarLeft,
      width: this.scrollbarWidth
    }

    const scrollSetting = this.handlebarRef.onHandlebarUpdate.startWith(initHB)
      .map(hb => {
        const zoom = 100/hb.width

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

    const mousemove: Observable<MouseEvent> = fromEventPattern(this._renderer, this._document, 'mousemove')
    const mouseup: Observable<MouseEvent> = fromEventPattern(this._renderer, this._document, 'mouseup')
    const placeHeadMd: Observable<MouseEvent> = fromEventPattern(this._renderer, this.timelineOverflowRef.nativeElement, 'mousedown')

    const placePlayHead = placeHeadMd.switchMap((md) => {
      const init = {clientX: md.clientX}

      return Observable.concat(
        Observable.of(init),
        mousemove.map(mmEvent => {
          const {clientX} = mmEvent
          return {clientX}
        }).takeUntil(mouseup))
    })

    this._subs.push(
      placePlayHead
        .withLatestFrom(this.zoomContainerRect, (ev: MouseEvent, rect) => {
          const localX = coordTransform(ev.clientX, rect)
          return {t: localX / rect.width}
        })
        .subscribe(({t}) => {
          this._store.dispatch(new player.PlayerRequestCurrentTime({currentTime: t*this.timeline.get('duration', null)}))
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

  updateTrack(payload: project.UpdateTrackPayload) {
    this._store.dispatch(new project.ProjectUpdateTrack(payload))
  }

  deleteTrack(deleteTrack: project.DeleteTrackPlayload) {
    this._store.dispatch(new project.ProjectDeleteTrack(deleteTrack))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
