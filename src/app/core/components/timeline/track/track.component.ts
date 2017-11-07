import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, AfterViewInit, ElementRef, ViewChild,
  OnDestroy, ChangeDetectorRef, Renderer2
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import 'rxjs/add/observable/combineLatest'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {ScrollSettings} from '../../../containers/timeline/timeline'
import {HandlebarChange} from '../handlebar/handlebar.component'
import {Track, Annotation} from '../../../../persistence/model'
import {fromEventPattern} from '../../../../lib/observable'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() readonly data: Track
  @Input() readonly totalDuration: number
  @Input() readonly scrollSettings: Observable<ScrollSettings>

  @ViewChild('annotationContainer') readonly annotationContainer: ElementRef

  readonly annotationRect = new ReplaySubject<ClientRect>(1)
  form: FormGroup|null = null
  zoom: number
  scrollLeft: number

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _renderer: Renderer2,
    private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.fields.title, Validators.required]
    })
  }

  ngAfterViewInit() {
    const getAnnotationRect = () => {
      return this.annotationContainer.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      Observable.merge(
        fromEventPattern(this._renderer, window, 'resize'),
        this.scrollSettings)
      .startWith()
      .subscribe(() => {
        this.annotationRect.next(getAnnotationRect())
      }));

    this._subs.push(
      Observable.combineLatest(
        this.annotationRect, this.scrollSettings,
        (rect, {zoom, scrollLeft}) => {
        // console.log('RECT', rect)
        return {zoom, left: (rect.width/100)*scrollLeft}
      }).subscribe(({zoom, left}) => {
        this.zoom = zoom
        this.scrollLeft = left
        this._cdr.markForCheck()
      }))
  }

  getAnnotationTitle(annotation: Annotation) {
    return annotation.fields.title
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

  handlebarChange(ev: HandlebarChange) {
    const {payload: annotation} = ev
    const tPerc = this.totalDuration/100
    const deltaStart = tPerc*ev.deltaLeft
    const deltaDuration = tPerc*ev.deltaWidth
    const newStart = annotation.utc_timestamp+(deltaStart/this.zoom)
    const newDuration = annotation.duration+(deltaDuration/this.zoom)

    // TODO: dispatch update annotation action to store
    annotation.utc_timestamp = newStart
    annotation.duration = newDuration
    this._cdr.markForCheck()
  }
}
