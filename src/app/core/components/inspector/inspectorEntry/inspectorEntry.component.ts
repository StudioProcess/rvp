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

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/distinctUntilChanged'

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

  @ViewChild('start') readonly startInput: ElementRef
  @ViewChild('duration') readonly durationInput: ElementRef
  @ViewChild('title') readonly titleInput: ElementRef
  @ViewChild('descr') readonly descrInput: ElementRef

  form: FormGroup|null = null

  private readonly _subs: Subscription[] = []

  constructor(readonly elem: ElementRef, private readonly _fb: FormBuilder) {}

  private _mapModel(entry: Record<AnnotationColorMap>) {
    const utc_timestamp = entry.getIn(['annotation', 'utc_timestamp'])
    const duration = entry.getIn(['annotation', 'duration'])
    const title = entry.getIn(['annotation', 'fields', 'title'])
    const description = entry.getIn(['annotation', 'fields', 'description'])

    return {
      utc_timestamp: formatDuration(utc_timestamp),
      duration: formatDuration(duration),
      title, description
    }
  }

  ngOnInit() {
    const {
      utc_timestamp, duration,
      title, description
    } = this._mapModel(this.entry)

    this.form = this._fb.group({
      utc_timestamp: [utc_timestamp, durationValidator],
      duration: [duration, durationValidator],
      title, description
    })
  }

  ngAfterViewInit() {
    const durationKeydown = Observable.merge(
      Observable.fromEvent(this.startInput.nativeElement, 'keydown'),
      Observable.fromEvent(this.durationInput.nativeElement, 'keydown'))

    const formKeydown = Observable.merge(
      durationKeydown,
      Observable.fromEvent(this.titleInput.nativeElement, 'keydown'),
      Observable.fromEvent(this.descrInput.nativeElement, 'keydown'))

    const enterHotKey = formKeydown.filter((ev: KeyboardEvent) => ev.keyCode === 13)

    const formBlur = Observable.merge(
      Observable.fromEvent(this.startInput.nativeElement, 'blur'),
      Observable.fromEvent(this.durationInput.nativeElement, 'blur'),
      Observable.fromEvent(this.titleInput.nativeElement, 'blur'),
      Observable.fromEvent(this.descrInput.nativeElement, 'blur'))

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
      durationKeydown
        .filter((ev: KeyboardEvent) => !validDurationInputKey(ev.keyCode))
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
        .withLatestFrom(Observable.combineLatest(this.form!.valueChanges, this.form!.statusChanges), (_, [form, status]) => {
          return [form, status]
        })
        .filter(([_, status]) => status === _VALID_)
        .map(([form]) => form)
        .distinctUntilChanged((prev, cur) => {
          return prev.title === cur.title && prev.description === cur.description &&
            prev.utc_timestamp === cur.utc_timestamp && prev.duration === cur.duration
        })
        .subscribe(({title, description, utc_timestamp, duration}) => {
          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp),
            duration: parseDuration(duration),
            fields: new AnnotationFieldsRecordFactory({
              title, description
            })
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
