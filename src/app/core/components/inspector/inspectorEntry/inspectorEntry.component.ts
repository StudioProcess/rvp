import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding
} from '@angular/core'

import {
  FormGroup, FormBuilder, AbstractControl,
  Validators, ValidatorFn, ValidationErrors
} from '@angular/forms'

const _VALID_ = 'VALID' // not exported by @angular/forms

import {Record} from 'immutable'

import {
  Subscription, combineLatest,
  merge, fromEvent
} from 'rxjs'

import {
  withLatestFrom, map, filter,
  distinctUntilChanged
} from 'rxjs/operators'

import {formatDuration} from '../../../../lib/time'

import {
  AnnotationColorMap, AnnotationRecordFactory,
  AnnotationFieldsRecordFactory, SelectionSource,
  AnnotationSelectionRecordFactory
} from '../../../../persistence/model'

import * as project from '../../../../persistence/actions/project'
import {parseDuration} from '../../../../lib/time'

function durationValidatorFactory(): ValidatorFn {
  const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/

  return (control: AbstractControl): ValidationErrors|null => {
    const valid = durationRegex.test(control.value)
    return !valid ? {'duration': {value: control.value}} : null
  }
}

const durationValidator = Validators.compose([Validators.required, durationValidatorFactory()])

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()

  @ViewChild('start') private readonly _startInputRef: ElementRef
  @ViewChild('duration') private readonly _durationInputRef: ElementRef
  @ViewChild('descr') private readonly _descrInputRef: ElementRef

  form: FormGroup|null = null

  private readonly _subs: Subscription[] = []

  constructor(readonly elem: ElementRef, private readonly _fb: FormBuilder) {}

  private _mapModel(entry: Record<AnnotationColorMap>) {
    const utc_timestamp = entry.getIn(['annotation', 'utc_timestamp'])
    const duration = entry.getIn(['annotation', 'duration'])
    const description = entry.getIn(['annotation', 'fields', 'description'])

    return {
      utc_timestamp: formatDuration(utc_timestamp),
      duration: formatDuration(duration),
      description
    }
  }

  ngOnInit() {
    const {
      utc_timestamp, duration,
      description
    } = this._mapModel(this.entry)

    this.form = this._fb.group({
      utc_timestamp: [utc_timestamp, durationValidator],
      duration: [duration, durationValidator],
      description
    })
  }

  ngAfterViewInit() {
    const durationKeydown = merge(
      fromEvent(this._startInputRef.nativeElement, 'keydown'),
      fromEvent(this._durationInputRef.nativeElement, 'keydown'))

    const formKeydown = merge(
      durationKeydown,
      fromEvent(this._descrInputRef.nativeElement, 'keydown'))

    const enterHotKey = formKeydown.pipe(filter((ev: KeyboardEvent) => ev.keyCode === 13))

    const formBlur = merge(
      fromEvent(this._startInputRef.nativeElement, 'blur'),
      fromEvent(this._durationInputRef.nativeElement, 'blur'),
      fromEvent(this._descrInputRef.nativeElement, 'blur'))

    this._subs.push(
      formKeydown.subscribe((ev: KeyboardEvent) => {
        ev.stopPropagation()
      }))

    const validDurationInputKey = (keyCode: number) => {
      return (keyCode >= 48 && keyCode <= 57) || // 0-9
        keyCode === 8 ||                         // backspace
        keyCode === 186 ||                       // :
        keyCode === 190 ||                       // .
        keyCode === 37 ||                        // left arrow
        keyCode === 39                           // right arrow
    }

    this._subs.push(
      durationKeydown.pipe(filter((ev: KeyboardEvent) => !validDurationInputKey(ev.keyCode)))
        .subscribe((ev: KeyboardEvent) => {
          ev.preventDefault()
        }))

    this._subs.push(
      enterHotKey.subscribe((ev: any) => {
        if(ev.target.nodeName !== 'TEXTAREA') {
          ev.target.blur()
        }
      }))

    this._subs.push(
      formBlur
        .pipe(
          withLatestFrom(combineLatest(this.form!.valueChanges, this.form!.statusChanges), (_, [form, status]) => {
            return [form, status]
          }),
          filter(([_, status]) => status === _VALID_),
          map(([form]) => form),
          distinctUntilChanged((prev, cur) => {
            return prev.title === cur.title && prev.description === cur.description &&
              prev.utc_timestamp === cur.utc_timestamp && prev.duration === cur.duration
          }))
        .subscribe(({description, utc_timestamp, duration}) => {
          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp),
            duration: parseDuration(duration),
            fields: new AnnotationFieldsRecordFactory({description})
          })

          this.onUpdate.emit({
            trackIndex: this.entry.get('trackIndex', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotationIndex: this.entry.get('annotationIndex', null),
            annotation
          })
        }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.form !== null && changes.entry !== undefined && !changes.entry.firstChange) {
      const {previousValue, currentValue} = changes.entry
      if(previousValue === undefined || !previousValue.equals(currentValue)) {
        this.form.setValue(this._mapModel(currentValue))
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }

  selectAnnotationHandler(ev: MouseEvent) {
    ev.stopPropagation()
    // Only consider left clicks
    if(ev.button !== 0) {
      return
    }
    this.onSelectAnnotation.emit({
      type: project.AnnotationSelectionType.Default,
      selection: AnnotationSelectionRecordFactory({
        track: this.entry.get('track', null),
        annotation: this.entry.get('annotation', null),
        source: SelectionSource.Inspector
      })
    })
  }
}
