import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, OnDestroy, EventEmitter, Output
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Record} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
// import {ScrollSettings} from '../timeline'
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

  @Output() readonly updateAnnotation = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly deleteTrack = new EventEmitter<project.DeleteTrackPlayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<selection.SelectionAnnotationPayload>()

  private readonly _subs: Subscription[] = []

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.getIn(['fields', 'title']), Validators.required]
    })
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

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }

  trackByFunc(_: number, track: Record<Track>) {
    return track.get('id', null)
  }

  deleteTrackHandler() {
    if(window.confirm("Really delete track? All annotations will be deleted too.")){
      this.deleteTrack.emit({trackIndex: this.trackIndex})
    }
  }

  selectAnnotation(annotation: Record<Annotation>) {
    this.onSelectAnnotation.emit({
      selection: new fromSelection.AnnotationSelectionFactory({
        annotation,
        source: fromSelection.SelectionSource.Timeline
      })
    })
  }

  handlebarUpdate(ev: Handlebar) {
    const {payload: annotationIndex} = ev
    const oldAnnotation = this.data.getIn(['annotations', annotationIndex])

    const tPerc = this.totalDuration/100
    const newStart = tPerc*ev.left
    const newDuration = tPerc*(ev.right-ev.left)

    this.updateAnnotation.emit({
      trackIndex: this.trackIndex,
      annotationIndex,
      annotation: AnnotationRecordFactory({
        ...oldAnnotation,
        utc_timestamp: newStart,
        duration: newDuration
      })
    })
  }
}
