import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Renderer2, ViewChild, ElementRef,
  AfterViewInit, Inject
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Store} from '@ngrx/store'

import {Record, Set} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
// import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'

import * as fromProject from '../../../persistence/reducers'
import * as fromPlayer from '../../../player/reducers'
import * as project from '../../../persistence/actions/project'
import * as player from '../../../player/actions'
import {Timeline, Track, Annotation} from '../../../persistence/model'
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
  selectedAnnotations: Set<Record<Annotation>>
  zoom = 1
  playerPos = 0
  playerCurrentTime = 0
  scrollbarLeft = 0
  scrollbarWidth = 100
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)
  readonly overflowContainerRect = new ReplaySubject<ClientRect>(1)
  readonly zoomContainerRect = new ReplaySubject<ClientRect>(1)

  @ViewChild('scrollbar') private readonly scrollbarRef: ElementRef
  @ViewChild('handlebar') private readonly handlebarRef: HandlebarComponent
  @ViewChild('timelineOverflow') private readonly timelineOverflowRef: ElementRef
  @ViewChild('zoomContainer') private readonly zoomContainerRef: ElementRef
  private readonly _subs: Subscription[] = []
  private readonly timelineSubj = this._store.select(fromProject.getProjectTimeline)
    .filter(timeline => timeline !== null)
    .share()

  constructor(
    private readonly _renderer: Renderer2,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngOnInit() {
    this._subs.push(
      this.timelineSubj.subscribe(timeline => {
        this.timeline = timeline as Record<Timeline> // use identifer! syntax?
        this._cdr.markForCheck()
      }))

    this._subs.push(
      this._store.select(fromProject.getSelectedAnnotations)
        .subscribe(selAnnotations => {
          this.selectedAnnotations = selAnnotations
          this._cdr.markForCheck()
        }))

    this._subs.push(
      this._store.select(fromPlayer.getCurrentTime)
        .withLatestFrom(this.timelineSubj, (currentTime, timeline) => {
          return {
            currentTime,
            progress: currentTime / timeline!.get('duration', null)
          }
        })
        .subscribe(({currentTime, progress}) => {
          this.playerPos = progress
          this.playerCurrentTime = currentTime
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    const getScrollbarRect = () => {
      return this.scrollbarRef.nativeElement.getBoundingClientRect()
    }

    const getOverflowContainerRect = () => {
      return this.timelineOverflowRef.nativeElement.getBoundingClientRect()
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
      winResize.startWith(null).subscribe(() => {
        this.overflowContainerRect.next(getOverflowContainerRect())
        this.zoomContainerRect.next(getZoomContainerRect())
      }))

    this._subs.push(
      Observable.combineLatest(
        this.overflowContainerRect, scrollSetting,
        (rect, {zoom, scrollLeft}) => {
          const zoomContainerWidth = zoom * rect.width
          const maxLeft = zoomContainerWidth-rect.width
          return {zoom, left: Math.min(zoomContainerWidth*scrollLeft/100, maxLeft)}
        }).distinctUntilChanged((prev, cur) => {
          return prev.left === cur.left && prev.zoom === cur.zoom
        }).subscribe(({zoom, left}) => {
          this.zoom = zoom
          this.timelineOverflowRef.nativeElement.scrollLeft = left
          this._cdr.markForCheck()

          setTimeout(() => {
            this.timelineOverflowRef.nativeElement.scrollLeft = left
            this._cdr.markForCheck()
          })

          setTimeout(() => {
            // Emit zoom container rect
            this.zoomContainerRect.next(getZoomContainerRect())
          })
        }))

    const mousemove: Observable<MouseEvent> = Observable.fromEvent(this._document, 'mousemove')
    const mouseup: Observable<MouseEvent> = Observable.fromEvent(this._document, 'mouseup')
    const placeHeadMd: Observable<MouseEvent> = Observable.fromEvent(this.timelineOverflowRef.nativeElement, 'mousedown')

    this._subs.push(placeHeadMd
      .switchMap(md => {
        const init = {clientX: md.clientX}
        return Observable.concat(
          Observable.of(init),
          mousemove.map(mmEvent => {
            const {clientX} = mmEvent
            return {clientX}
          }).takeUntil(mouseup))
      })
      .withLatestFrom(this.zoomContainerRect, (ev: MouseEvent, rect) => {
        const localX = coordTransform(ev.clientX, rect)
        return localX / rect.width
      })
      .map(progress => {
        return Math.max(0, Math.min(progress, 1))
      })
      .distinctUntilChanged()
      .withLatestFrom(this.timelineSubj, (progress, tl) => {
        const totalTime = tl!.get('duration', null)
        return {
          progress,
          currentTime: progress*totalTime
        }
      })
      .subscribe(({progress, currentTime}) => {
        this.playerPos = progress
        this.playerCurrentTime = currentTime
        this._cdr.markForCheck()
        this._store.dispatch(new player.PlayerRequestCurrentTime({currentTime}))
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

  selectAnnotation(annotation: project.SelectAnnotationPayload) {
    this._store.dispatch(new project.ProjectSelectAnnotation(annotation))
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

  duplicateTrack(duplicateTrack: project.DuplicateTrackPayload) {
    this._store.dispatch(new project.ProjectDuplicateTrack(duplicateTrack))
  }

  insertTrackAt(insertTrackAt: project.TrackInsertAtPayload) {
    this._store.dispatch(new project.ProjectInsertAtTrack(insertTrackAt))
  }

  pasteAnnotations(pasteAnnotations: project.PasteClipboardPayload) {
    this._store.dispatch(new project.ProjectPasteClipBoard(pasteAnnotations))
  }

  getNumTracks() {
    return this.timeline.get('tracks', null).size
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
