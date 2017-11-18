import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, AfterViewInit, ElementRef, ViewChild,
  OnDestroy, ChangeDetectorRef, EventEmitter,
  Output
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Record} from 'immutable'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import 'rxjs/add/observable/combineLatest'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {ScrollSettings} from '../../../containers/timeline/timeline'
import {Handlebar} from '../handlebar/handlebar.component'
import {Track, Annotation, AnnotationRecordFactory} from '../../../../persistence/model'
import {UpdateAnnotationPayload} from '../../../../persistence/actions/project'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() readonly data: Record<Track>
  @Input() readonly trackIndex: number
  @Input() readonly totalDuration: number
  @Input() readonly scrollSettings: Observable<ScrollSettings>

  readonly annotationRect = new ReplaySubject<ClientRect>(1)
  form: FormGroup|null = null
  zoom: number
  scrollLeft: number

  @Output() readonly updateAnnotation = new EventEmitter<UpdateAnnotationPayload>()

  @ViewChild('annotationContainer') private readonly annotationContainer: ElementRef
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.getIn(['fields', 'title']), Validators.required]
    })
  }

  ngAfterViewInit() {
    const getAnnotationRect = () => {
      return this.annotationContainer.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      this.scrollSettings.subscribe(() => {
        this.annotationRect.next(getAnnotationRect())
      }))

    this._subs.push(
      Observable.combineLatest(
        this.annotationRect, this.scrollSettings,
        (rect, {zoom, scrollLeft}) => {
          return {zoom, left: (rect.width/100)*scrollLeft}
        }).subscribe(({zoom, left}) => {
          this.zoom = zoom
          this.scrollLeft = left
          this._cdr.markForCheck()
        }))
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

  trackByFunc(index: number) {
    return index
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
