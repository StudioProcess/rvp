import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, AfterViewInit, ElementRef, ViewChild,
  OnDestroy, ChangeDetectorRef, Renderer2
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {animationFrame as animationScheduler} from 'rxjs/scheduler/animationFrame';
import 'rxjs/add/observable/combineLatest'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {ScrollSettings} from '../../../containers/timeline/timeline'
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

  @ViewChild('annotations') readonly annotations: ElementRef

  form: FormGroup|null = null
  zoom: number
  scrollLeft: number
  readonly annotationsRect = new ReplaySubject<ClientRect>(1)

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
    const getAnnotationsRect = () => {
      return this.annotations.nativeElement.getBoundingClientRect()
    }

    this._subs.push(
      fromEventPattern(this._renderer, window, 'resize')
        .map(() => getAnnotationsRect())
        .startWith(getAnnotationsRect())
        .subscribe(clientRect => {
          this.annotationsRect.next(clientRect)
          this._cdr.markForCheck()
        }))

    this._subs.push(
      Observable.combineLatest(
        this.annotationsRect, this.scrollSettings, (rect, {zoom, scrollLeft}) => {
        // Calc width of zoomed container in px
        const innerWidthPX = rect.width * zoom
        // Set
        const left = innerWidthPX*scrollLeft/100
        return {zoom, left}
      }, animationScheduler).subscribe(({zoom, left}) => {
        this.zoom = zoom*100;
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
}
