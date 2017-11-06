import {
  Component, Input, ChangeDetectionStrategy,
  OnInit, AfterViewInit, ElementRef, ViewChild,
  OnDestroy, ChangeDetectorRef, Renderer2
} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Subscription} from 'rxjs/Subscription'
import {ReplaySubject} from 'rxjs/ReplaySubject'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'
import {Track, Annotation} from '../../../../persistence/model'

import {fromEventPattern} from '../../../../lib/observable'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data: Track
  @Input() totalDuration: number

  @ViewChild('annotations') annotations: ElementRef

  form: FormGroup|null = null

  private readonly _subs: Subscription[] = []

  annotationsRect = new ReplaySubject<ClientRect>(1)

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
    const getAnnotationsRect = () => this.annotations.nativeElement.getBoundingClientRect()
    this._subs.push(fromEventPattern(this._renderer, window, 'resize')
      .map(() => getAnnotationsRect())
      .startWith(getAnnotationsRect())
      .subscribe(clientRect => {
        this.annotationsRect.next(clientRect)
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
