import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, EventEmitter, Output
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Record} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'
import {Subscription} from 'rxjs/Subscription'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {coordTransform} from '../../../../lib/coords'
import {Handlebar} from '../handlebar/handlebar.component'
import {Track, Annotation, AnnotationRecordFactory} from '../../../../persistence/model'
import * as project from '../../../../persistence/actions/project'
import * as selection from '../../../actions/selection'
import * as fromSelection from '../../../reducers/selection'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {
  @Input() readonly data: Record<Track>
  @Input() readonly trackIndex: number
  @Input() readonly totalDuration: number
  @Input() readonly selectedAnnotationId: number
  @Input() readonly containerRect: Observable<ClientRect>

  form: FormGroup|null = null
  zoom: number
  scrollLeft: number

  @Output() readonly onUpdateAnnotation = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onDeleteTrack = new EventEmitter<project.DeleteTrackPlayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<selection.SelectionAnnotationPayload>()
  @Output() readonly onAddAnnotation = new EventEmitter<project.AddAnnotationPayload>()

  private readonly _subs: Subscription[] = []
  private readonly addAnnotationClick = new Subject<MouseEvent>()

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.getIn(['fields', 'title']), Validators.required]
    })

    this._subs.push(
      this.addAnnotationClick.withLatestFrom(this.containerRect, (ev, rect) => {
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
      }).subscribe(this.onAddAnnotation))
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

  handlebarUpdate(ev: Handlebar) {
    const {payload: annotationIndex} = ev
    const oldAnnotation = this.data.getIn(['annotations', annotationIndex])

    const tPerc = this.totalDuration/100
    const newStart = tPerc*ev.left
    const newDuration = tPerc*(ev.right-ev.left)

    this.onUpdateAnnotation.emit({
      trackIndex: this.trackIndex,
      annotationIndex,
      annotation: AnnotationRecordFactory({
        ...oldAnnotation,
        utc_timestamp: newStart,
        duration: newDuration
      })
    })
  }

  ngOnDestroy() {
    this.addAnnotationClick.complete()

    this._subs.forEach(sub => sub.unsubscribe())
  }
}
