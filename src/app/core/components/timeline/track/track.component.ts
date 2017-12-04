import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, EventEmitter, Output,
  OnChanges, SimpleChanges, ViewChild,
  ElementRef
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

//const _VALID_ = 'VALID' // not exported by @angular/forms

import {Record, Set} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'
import {Subscription} from 'rxjs/Subscription'
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/distinctUntilChanged'

import {
  Track, Annotation, AnnotationRecordFactory,
  //TrackRecordFactory, TrackFieldsRecordFactory,
  AnnotationSelectionRecordFactory, SelectionSource
} from '../../../../persistence/model'
import {_FORM_INPUT_DEBOUNCE_} from '../../../../config/form'
import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {coordTransform} from '../../../../lib/coords'
import {Handlebar} from '../handlebar/handlebar.component'
import * as project from '../../../../persistence/actions/project'

interface EmitAnnotationSelectionArgs {
  readonly track: Record<Track>
  readonly annotation: Record<Annotation>
  readonly type: project.AnnotationSelectionType
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, OnChanges, OnDestroy {
  @Input() readonly data: Record<Track>
  @Input() readonly trackIndex: number
  @Input() readonly numTracks: number
  @Input() readonly totalDuration: number
  @Input() readonly selectedAnnotations: Set<Record<Annotation>>
  @Input() readonly containerRect: Observable<ClientRect>

  form: FormGroup|null = null
  zoom: number
  scrollLeft: number

  @Output() readonly onUpdateTrack = new EventEmitter<project.UpdateTrackPayload>()
  @Output() readonly onUpdateAnnotation = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onDeleteTrack = new EventEmitter<project.DeleteTrackPlayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onAddAnnotation = new EventEmitter<project.AddAnnotationPayload>()
  @Output() readonly onDuplicateTrack = new EventEmitter<project.DuplicateTrackPayload>()
  @Output() readonly onInsertAtTrack = new EventEmitter<project.TrackInsertAtPayload>()
  @Output() readonly onPasteAnnotations = new EventEmitter<project.PasteClipboardPayload>()

  private readonly _subs: Subscription[] = []
  private readonly addAnnotationClick = new Subject<{ev: MouseEvent, stackIndex: number}>()
  private readonly updateAnnotationSubj = new Subject<{hb: Handlebar, annotationIndex: number}>()
  private readonly annotationMdSubj = new Subject<{ev: MouseEvent, annotation: Record<Annotation>, annotationIndex: number}>()

  @ViewChild('title') private readonly titleInput: ElementRef

  constructor(
    private readonly _elem: ElementRef,
    private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.getIn(['fields', 'title']), Validators.required]
    })

    const titleInputMd = Observable.fromEvent(this.titleInput.nativeElement, 'mousedown')
    const titleInputKeydown = Observable.fromEvent(this.titleInput.nativeElement, 'keydown')
    //const formBlur = Observable.fromEvent(this.titleInput.nativeElement, 'blur')

    const hostMouseEnterTs = Observable.fromEvent(this._elem.nativeElement, 'mouseenter').map(() => Date.now())
    const hostMouseLeaveTs = Observable.fromEvent(this._elem.nativeElement, 'mouseleave').map(() => Date.now()).startWith(Date.now())

    const hostHover = hostMouseEnterTs
      .combineLatest(hostMouseLeaveTs, (enterTs, leaveTs) => {
        return enterTs > leaveTs
      })

    const pasteHotkey: Observable<KeyboardEvent> = Observable.fromEvent(window, 'keydown')
      .filter((ev: KeyboardEvent) => {
        return ev.keyCode === 86 && ev.metaKey // cmd v
      })

    this._subs.push(
      pasteHotkey.withLatestFrom(hostHover).filter(([, hover]) => hover)
        .subscribe(() => {
          this.onPasteAnnotations.next({trackIndex: this.trackIndex})
        }))

    this._subs.push(
      titleInputMd.subscribe((ev: KeyboardEvent) => {
        ev.stopPropagation()
      }))

    this._subs.push(
      titleInputKeydown.subscribe((ev: KeyboardEvent) => {
        ev.stopPropagation()
      }))

    this._subs.push(
      titleInputKeydown
        .filter((ev: KeyboardEvent) => ev.keyCode === 13)
        .subscribe((ev: any) => {
          ev.target.blur()
        }))

    // this._subs.push(
    //   formBlur
    //     .withLatestFrom(Observable.combineLatest(this.form.valueChanges, this.form.statusChanges), (_, [form, status]) => {
    //       return [form, status]
    //     })
    //     .filter(([_, status]) => status === _VALID_)
    //     .map(([formData, _]) => formData)
    //     .distinctUntilChanged((prev, cur) => {
    //       return prev.title === cur.title
    //     })
    //     .subscribe(({title}) => {
    //       const updateTrackPayload = {
    //         trackIndex: this.trackIndex,
    //         track: new TrackRecordFactory({
    //           id: this.data.get('id', null),
    //           color: this.data.get('color', null),
    //           fields: new TrackFieldsRecordFactory({title}),
    //           annotations: this.data.get('annotations', null)
    //         })
    //       }
    //       this.onUpdateTrack.emit(updateTrackPayload)
    //     }))

    this._subs.push(
      this.addAnnotationClick
        .withLatestFrom(this.containerRect, ({ev, stackIndex}, rect) => {
          const localX = coordTransform(ev.clientX, rect)
          const perc = localX/rect.width*100
          const tPerc = this.totalDuration/100
          return {
            trackIndex: this.trackIndex,
            annotationStackIndex: stackIndex,
            annotation: new AnnotationRecordFactory({
              utc_timestamp: perc*tPerc,
              duration: 5
            })
          }
        })
        .subscribe(this.onAddAnnotation))

    this._subs.push(
      this.updateAnnotationSubj
        .debounceTime(_FORM_INPUT_DEBOUNCE_, animationScheduler)
        .subscribe(({hb, annotationIndex}) => {
          const oldAnnotation = this.data.getIn(['annotations', annotationIndex])

          const tPerc = this.totalDuration/100
          const newStart = tPerc*hb.left
          const newDuration = tPerc*hb.width

          this.onUpdateAnnotation.emit({
            trackIndex: this.trackIndex,
            annotationIndex,
            annotation: AnnotationRecordFactory({
              id: oldAnnotation.get('id', null),
              fields: oldAnnotation.get('fields', null),
              utc_timestamp: newStart,
              duration: newDuration
            })
          })
        }))

    const defaultClick = this.annotationMdSubj.filter(({ev}) => !ev.shiftKey && !ev.metaKey)
    const rangeClick = this.annotationMdSubj.filter(({ev}) => ev.shiftKey && !ev.metaKey)
    const pickClick = this.annotationMdSubj.filter(({ev}) => !ev.shiftKey && ev.metaKey)

    defaultClick.subscribe(({annotationIndex, annotation}) => {
      this.emitSelectAnnotation({
        type: project.AnnotationSelectionType.Default,
        track: this.data, annotation
      })
    })

    rangeClick.subscribe(({annotationIndex, annotation}) => {
      this.emitSelectAnnotation({
        type: project.AnnotationSelectionType.Range,
        track: this.data, annotation
      })
    })

    pickClick.subscribe(({annotationIndex, annotation}) => {
      this.emitSelectAnnotation({
        type: project.AnnotationSelectionType.Pick,
        track: this.data, annotation
      })
    })
  }

  private emitSelectAnnotation({track, annotation, type}: EmitAnnotationSelectionArgs) {
    this.onSelectAnnotation.emit({
      type,
      selection: AnnotationSelectionRecordFactory({
        track, annotation,
        source: SelectionSource.Timeline
      })
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.form !== null && changes.data !== undefined && !changes.data.firstChange) {
      const {previousValue, currentValue} = changes.data
      if(previousValue === undefined || !previousValue.equals(currentValue)) {
        this.form.setValue({
          title: currentValue.getIn(['fields', 'title'])
        })
      }
    }
  }

  getAnnotationTitle(annotation: Record<Annotation>) {
    return annotation.getIn(['fields', 'title'])
  }

  getAnnotationPosition(annotation: Annotation) {
    return Math.min(Math.max(0, annotation.utc_timestamp / this.totalDuration * 100), 100)
  }

  getAnnotationWidth(annotation: Annotation) {
    return Math.min(Math.max(_MIN_WIDTH_, annotation.duration / this.totalDuration * 100), 100)
  }

  isSelectedAnnotation(annotation: Record<Annotation>) {
    return this.selectedAnnotations ?
      this.selectedAnnotations.find(sel => sel.get('id', null) === annotation.get('id', null)) !== undefined :
      null
  }

  trackByFunc(_: number, track: Record<Track>) {
    return track.get('id', null)
  }

  deleteTrackHandler(ev: MouseEvent) {
    ev.stopPropagation()
    if(window.confirm("Really delete track? All annotations will be deleted too.")){
      this.onDeleteTrack.emit({trackIndex: this.trackIndex})
    }
  }

  annotationClick(ev: MouseEvent, annotation: Record<Annotation>, annotationIndex: number) {
    ev.stopPropagation()
    this.annotationMdSubj.next({ev, annotation, annotationIndex})
  }

  addAnnotation(ev: MouseEvent, stackIndex: number) {
    this.addAnnotationClick.next({ev, stackIndex})
  }

  updateHandlebar(hb: Handlebar, annotationIndex: number) {
    this.updateAnnotationSubj.next({hb, annotationIndex})
  }

  moveTrack($event: MouseEvent, trackIndex: number, direction: 'up'|'down') {
    $event.stopPropagation()
    this.onInsertAtTrack.emit({
      currentTrackIndex: trackIndex,
      insertAtIndex: direction === 'up' ? trackIndex-1 : trackIndex+1
    })
  }

  duplicateTrack($event: MouseEvent, trackIndex: number) {
    $event.stopPropagation()
    this.onDuplicateTrack.emit({trackIndex})
  }

  ngOnDestroy() {
    this.addAnnotationClick.complete()

    this._subs.forEach(sub => sub.unsubscribe())
  }
}
