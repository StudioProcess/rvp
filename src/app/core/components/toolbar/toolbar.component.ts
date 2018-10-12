import {
  Component, Input, OnInit,
  Output, ChangeDetectionStrategy,
  AfterViewInit, ViewChild,
  ElementRef, EventEmitter
} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'

import {fromEvent, Subscription} from 'rxjs'
import {debounceTime, pluck} from 'rxjs/operators'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  @Input('currentAnnotationsOnly') readonly currentAnnotationsOnlyIn: boolean
  @Input('search') readonly searchIn: string
  @Input('applyToTimeline') readonly applyToTimelineIn: boolean

  form: FormGroup|null = null

  @Output() readonly onCurrentAnnotationsOnlyChange = new EventEmitter<boolean>()
  @Output() readonly onSearchChange = new EventEmitter<string>()
  @Output() readonly onApplyToTimelineChange = new EventEmitter<boolean>()

  @ViewChild('search') private readonly _searchRef: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(private readonly _fb: FormBuilder) {}

  private _mapModel() {
    return {
      currentAnnotationsOnly: this.currentAnnotationsOnlyIn,
      search: this.searchIn,
      applyToTimeline: this.applyToTimelineIn
    }
  }

  ngOnInit() {
    this.form = this._fb.group(this._mapModel())

    this._subs.push(
      this.form.valueChanges
      .pipe(
        pluck('currentAnnotationsOnly'))
      .subscribe((value: boolean) => {
        this.onCurrentAnnotationsOnlyChange.emit(value)
      }))

    this._subs.push(
      this.form.valueChanges
      .pipe(
        pluck('search'), debounceTime(_FORM_INPUT_DEBOUNCE_))
      .subscribe((value: string) => {
        this.onSearchChange.emit(value)
      }))

    this._subs.push(
      this.form.valueChanges
        .pipe(pluck('applyToTimeline'))
        .subscribe((value: boolean) => {
          this.onApplyToTimelineChange.emit(value)
        }))
  }

  ngAfterViewInit() {
    this._subs.push(fromEvent(this._searchRef.nativeElement, 'keydown').subscribe((ev: KeyboardEvent) => {
      ev.stopPropagation()
    }))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
