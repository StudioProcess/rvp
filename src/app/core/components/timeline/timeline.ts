import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef,
  AfterViewInit, Inject
} from '@angular/core'

import { DOCUMENT } from '@angular/common'

import { Store } from '@ngrx/store'

import { Record, Set } from 'immutable'

import {
  Observable, ReplaySubject, Subscription, combineLatest,
  fromEvent, concat, of
} from 'rxjs'

import {
  switchMap, filter, map, takeUntil,
  withLatestFrom, startWith, distinctUntilChanged,
  share
} from 'rxjs/operators'

import * as fromProject from '../../../persistence/reducers'
import * as project from '../../../persistence/actions/project'
import { Timeline, Track, Annotation } from '../../../persistence/model'
import { HandlebarComponent } from '../../components/timeline/handlebar/handlebar.component'
import { _SCROLLBAR_CAPTION_ } from '../../../config/timeline/scrollbar'
import { rndColor } from '../../../lib/color'
import { Globals } from '../../../common/globals'

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
  pZoom = 0
  playerPos = 0
  playerCurrentTime = 0
  scrollbarLeft = 0
  scrollbarWidth = 100
  viewmode_active: boolean = false
  readonly scrollbarCaption = _SCROLLBAR_CAPTION_
  readonly scrollbarRect = new ReplaySubject<ClientRect>(1)
  readonly timelineWrapperRect = new ReplaySubject<ClientRect>(1)
  readonly scrollSettings = new ReplaySubject<ScrollSettings>(1)

  @ViewChild('scrollbar', { static: true }) private readonly _scrollbarRef: ElementRef
  @ViewChild('handlebar', { static: true }) private readonly _handlebarRef: HandlebarComponent
  @ViewChild('timelineWrapper', { static: true }) private readonly _timelineWrapperRef: ElementRef
  @ViewChild('playheadOverflow', { static: true }) private readonly _playheadOverflowRef: ElementRef
  private readonly _subs: Subscription[] = []
  private readonly _timelineSubj = this._store.select(fromProject.getProjectQueriedTimeline)
    .pipe(filter(timeline => timeline !== null), share())

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    private global: Globals,
    @Inject(DOCUMENT) private readonly _document: any) { }

  ngOnInit() {

    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
    })

    this._subs.push(
      this._timelineSubj.subscribe(timeline => {
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
      this._store.select(fromProject.getCurrentTime)
        .pipe(
          withLatestFrom(this._timelineSubj, (currentTime, timeline) => {
            return {
              currentTime,
              progress: currentTime / timeline!.get('duration', null)
            }
          }))
        .subscribe(({ currentTime, progress }) => {
          this.playerPos = progress
          this.playerCurrentTime = currentTime
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    const getScrollbarRect = () => {
      return this._scrollbarRef.nativeElement.getBoundingClientRect()
    }

    const getTimelineWrapperRect = () => {
      return this._timelineWrapperRef.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      this._handlebarRef.onHandlebarUpdate.subscribe(hb => {
        // Set new left and width
        this.scrollbarLeft = hb.left
        this.scrollbarWidth = hb.width
        this._cdr.markForCheck()
      }))

    const initHB = {
      left: this.scrollbarLeft,
      width: this.scrollbarWidth
    }

    const handlebarSettings = this._handlebarRef.onHandlebarUpdate.pipe(
      startWith(initHB),
      map(hb => {
        const zoom = 100 / hb.width
        return { zoom, scrollLeft: hb.left }
      }))

    const winResize: Observable<Event | null> = fromEvent(window, 'resize')

    this._subs.push(
      winResize.pipe(startWith(null)).subscribe(() => {
        this.scrollbarRect.next(getScrollbarRect())
        this.timelineWrapperRect.next(getTimelineWrapperRect())
      }))

    this._subs.push(combineLatest(
      this.timelineWrapperRect, handlebarSettings,
      (rect, { zoom, scrollLeft }) => {
        const zoomContainerWidth = zoom * rect.width
        const maxLeft = zoomContainerWidth - rect.width
        return { zoom, left: Math.max(0, Math.min(zoomContainerWidth * scrollLeft / 100, maxLeft)) }
      }).pipe(distinctUntilChanged((prev, cur) => {
        return prev.left === cur.left && prev.zoom === cur.zoom
      })).subscribe(({ zoom, left }) => {
        this.scrollSettings.next({ zoom, scrollLeft: left })
      }))

    this._subs.push(
      this.scrollSettings.subscribe(({ zoom, scrollLeft }) => {
        this.pZoom = zoom
        this._playheadOverflowRef.nativeElement.scrollLeft = scrollLeft

        setTimeout(() => {
          this._playheadOverflowRef.nativeElement.scrollLeft = scrollLeft
          this._cdr.markForCheck()
        })
        this._cdr.markForCheck()
      }))

    const isLeftBtn = (ev: MouseEvent) => ev.button === 0

    const mousemove: Observable<MouseEvent> = fromEvent(this._document, 'mousemove')
    const mouseup: Observable<MouseEvent> = fromEvent(this._document, 'mouseup')
    const placeHeadMd: Observable<MouseEvent> = fromEvent(this._timelineWrapperRef.nativeElement, 'mousedown').pipe(filter(isLeftBtn))

    const zoomContainer = combineLatest(
      this.timelineWrapperRect, this.scrollSettings,
      (rect, { zoom, scrollLeft }) => {
        return { x: rect.left - scrollLeft, width: zoom * rect.width }
      })

    this._subs.push(placeHeadMd
      .pipe(
        switchMap(md => {
          const init = { clientX: md.clientX }
          return concat(
            of(init),
            mousemove.pipe(
              map(mmEvent => {
                const { clientX, clientY } = mmEvent
                return { clientX, clientY }
              }),
              takeUntil(mouseup)))
        }),
        withLatestFrom(zoomContainer, (ev: MouseEvent, { x, width }) => {
          const localX = ev.clientX - x
          return localX / width
        }),
        map(progress => {
          return Math.max(0, Math.min(progress, 1))
        }),
        distinctUntilChanged(),
        withLatestFrom(this._timelineSubj, (progress, tl) => {
          const totalTime = tl!.get('duration', null)
          return {
            progress,
            currentTime: progress * totalTime
          }
        }))
      .subscribe(({ progress, currentTime }) => {
        this.playerPos = progress
        this.playerCurrentTime = currentTime
        this._cdr.markForCheck()
        this._store.dispatch(new project.PlayerRequestCurrentTime({ currentTime }))
      }))
  }

  trackByFunc(_: number, track: Record<Track>) {
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
    this._store.dispatch(new project.ProjectAddTrack({ color: rndColor() }))
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

  setActiveTrack(activeTrack: project.ProjectSetActiveTrackPayload) {
    this._store.dispatch(new project.ProjectSetActiveTrack(activeTrack))
  }

  getNumTracks() {
    return this.timeline.get('tracks', null).size
  }

  focusAnnotation(focusAnnotation: project.PlayerRequestCurrentTimePayload) {
    this._store.dispatch(new project.PlayerRequestCurrentTime(focusAnnotation))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
