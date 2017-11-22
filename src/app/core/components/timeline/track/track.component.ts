import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, EventEmitter, Output,
  OnChanges, SimpleChanges
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Record} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'
import {Subscription} from 'rxjs/Subscription'
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame'

import {
  Track, Annotation, AnnotationRecordFactory,
  TrackRecordFactory, TrackFieldsRecordFactory
} from '../../../../persistence/model'
import {_FORM_INPUT_DEBOUNCE_} from '../../../../config/form'
import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {coordTransform} from '../../../../lib/coords'
import {Handlebar} from '../handlebar/handlebar.component'
import * as project from '../../../../persistence/actions/project'
import * as selection from '../../../actions/selection'
import * as fromSelection from '../../../reducers/selection'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, OnChanges, OnDestroy {
  @Input() readonly data: Record<Track>
  @Input() readonly trackIndex: number
  @Input() readonly totalDuration: number
  @Input() readonly selectedAnnotationId: number
  @Input() readonly containerRect: Observable<ClientRect>

  form: FormGroup|null = null
  zoom: number
  scrollLeft: number

  @Output() readonly onUpdateTrack = new EventEmitter<project.UpdateTrackPayload>()
  @Output() readonly onUpdateAnnotation = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onDeleteTrack = new EventEmitter<project.DeleteTrackPlayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<selection.SelectionAnnotationPayload>()
  @Output() readonly onAddAnnotation = new EventEmitter<project.AddAnnotationPayload>()

  private readonly _subs: Subscription[] = []
  private readonly addAnnotationClick = new Subject<MouseEvent>()
  private readonly updateAnnotationSubj = new Subject<{hb: Handlebar, annotationIndex: number}>()

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.getIn(['fields', 'title']), Validators.required]
    })

    this._subs.push(
      this.form.valueChanges.withLatestFrom(this.form.statusChanges)
        .debounceTime(_FORM_INPUT_DEBOUNCE_, animationScheduler)
        .map(([formData, _]) => formData)
        .distinctUntilChanged((prev, cur) => {
          return prev.title === cur.title
        })
        .subscribe(({title}) => {
          const updateTrackPayload = {
            trackIndex: this.trackIndex,
            track: new TrackRecordFactory({
              id: this.data.get('id', null),
              color: this.data.get('color', null),
              fields: new TrackFieldsRecordFactory({title}),
              annotations: this.data.get('annotations', null)
            })
          }

          this.onUpdateTrack.emit(updateTrackPayload)
        }))

    this._subs.push(
      this.addAnnotationClick
        .withLatestFrom(this.containerRect, (ev, rect) => {
          const localX = coordTransform(ev.clientX, rect)
          const perc = localX/rect.width*100
          const tPerc = this.totalDuration/100
          return {
            trackIndex: this.trackIndex,
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

  trackByFunc(_: number, track: Record<Track>) {
    return track.get('id', null)
  }

  deleteTrackHandler() {
    if(window.confirm("Really delete track? All annotations will be deleted too.")){
      this.onDeleteTrack.emit({trackIndex: this.trackIndex})
    }
  }

  selectAnnotation(ev: MouseEvent, annotation: Record<Annotation>, annotationIndex: number) {
    ev.stopPropagation()
    this.onSelectAnnotation.emit({
      selection: new fromSelection.AnnotationSelectionFactory({
        annotationIndex,
        trackIndex: this.trackIndex,
        annotation,
        source: fromSelection.SelectionSource.Timeline
      })
    })
  }

  addAnnotation(ev: MouseEvent) {
    this.addAnnotationClick.next(ev)
  }

  updateHandlebar(hb: Handlebar, annotationIndex: number) {
    this.updateAnnotationSubj.next({hb, annotationIndex})
  }

  ngOnDestroy() {
    this.addAnnotationClick.complete()

    this._subs.forEach(sub => sub.unsubscribe())
  }
}
