import {
  Component, Input, OnChanges, OnInit,
  Output, ChangeDetectionStrategy,
  SimpleChanges, AfterViewInit, ViewChild,
  ElementRef, EventEmitter
} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'

import {fromEvent, Subscription} from 'rxjs'
import {skip, debounceTime, pluck} from 'rxjs/operators'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, OnChanges, AfterViewInit {
  @Input('inspectorMode') readonly inspectorModeIn: boolean
  @Input('search') readonly searchIn: string
  @Input('applyToTimeline') readonly applyToTimelineIn: boolean

  form: FormGroup|null = null

  @Output() readonly onInspectorModeChange = new EventEmitter<boolean>()
  @Output() readonly onSearchChange = new EventEmitter<string>()
  @Output() readonly onApplyToTimelineChange = new EventEmitter<boolean>()

  @ViewChild('search') private readonly _searchRef: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(private readonly _fb: FormBuilder) {}

  private _mapModel() {
    return {
      inspectorMode: this.inspectorModeIn,
      search: this.searchIn,
      applyToTimeline: this.applyToTimelineIn
    }
  }

  ngOnInit() {
    this.form = this._fb.group(this._mapModel())

    this._subs.push(
      this.form.valueChanges
      .pipe(
        pluck('inspectorMode'), skip(1))
      .subscribe((value: boolean) => {
        this.onInspectorModeChange.emit(value)
      }))

    this._subs.push(
      this.form.valueChanges
      .pipe(
        pluck('search'), skip(1), debounceTime(_FORM_INPUT_DEBOUNCE_))
      .subscribe((value: string) => {
        this.onSearchChange.emit(value)
      }))

    this._subs.push(
      this.form.valueChanges
        .pipe(pluck('applyToTimeline'), skip(1))
        .subscribe((value: boolean) => {
          this.onApplyToTimelineChange.emit(value)
        }))
  }

  ngAfterViewInit() {
    this._subs.push(fromEvent(this._searchRef.nativeElement, 'keydown').subscribe((ev: KeyboardEvent) => {
      ev.stopPropagation()
    }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.form !== null && changes.inspectorModeIn !== undefined && !changes.inspectorModeIn.firstChange) {
      const {previousValue, currentValue} = changes.inspectorModeIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.form.setValue(this._mapModel())
      }
    }

    if(this.form !== null && changes.applyToTimelineIn !== undefined && !changes.applyToTimelineIn.firstChange) {
      const {previousValue, currentValue} = changes.applyToTimelineIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.form.setValue(this._mapModel())
      }
    }

    if(this.form !== null && changes.searchIn !== undefined && !changes.searchIn.firstChange) {
      const {previousValue, currentValue} = changes.searchIn
      if(previousValue === undefined || previousValue !== currentValue) {
        this.form.setValue(this._mapModel())
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
