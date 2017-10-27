import {
  Component, Input, Output,
  OnChanges, EventEmitter
} from '@angular/core'

import {
  FormGroup, FormBuilder, AbstractControl,
  Validators, ValidatorFn, ValidationErrors
} from '@angular/forms'

const VALID = 'VALID' // not exported by Angular

import * as moment from 'moment'

import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

import {AnnotationColorMap, Annotation} from '../../../persistence/model'

function formatDuration(unixTime: number): string {
  return moment.unix(unixTime).utc().format('HH:mm:ss.SSS')
}

const parseDurationRegex = /^(?:(?:([0-9]*):)|(?:([0-9]*):([0-9]*):))?([0-9]*)(?:\.([0-9]*))?$/

function parseDuration(durationStr: string): number {
  let result = parseDurationRegex.exec(durationStr)
  if(result === null) {
    return 0
  } else {
    let m1 = result[1] ? parseInt(result[1], 10) : 0;
    let h = result[2] ? parseInt(result[2], 10) : 0;
    let m2 = result[3] ? parseInt(result[3], 10) : 0;
    let s = result[4] ? parseInt(result[4], 10) : 0;
    let sFract = result[5] ? parseFloat('.'+result[5]) : 0;
    return h*3600 + m1*60 + m2*60 + s + sFract;
  }
}

function durationValidatorFactory(): ValidatorFn {
  const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/

  return (control: AbstractControl): ValidationErrors|null => {
    const valid = durationRegex.test(control.value)
    return !valid ? {'duration': {value: control.value}} : null;
  }
}

const durationValidator = Validators.compose([Validators.required, durationValidatorFactory()])

@Component({
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent implements OnChanges {
  @Input() entry: AnnotationColorMap
  @Input() index: number

  @Output() onUpdate = new EventEmitter<{index: number, trackIndex: number, annotation: Annotation}>()

  form: FormGroup|null = null

  constructor(private readonly _fb: FormBuilder) {}

  private _mapModel(entry: AnnotationColorMap) {
    const {
      annotation: {
        utc_timestamp, duration,
        fields: {title, description}
      }
    } = entry

    return {
      utc_timestamp: [formatDuration(utc_timestamp), durationValidator],
      duration: [formatDuration(duration), durationValidator],
      title, description
    }
  }

  ngOnInit() {
    this.form = this._fb.group(this._mapModel(this.entry))

    this.form.valueChanges.combineLatest(this.form.statusChanges)
      .debounceTime(_FORM_INPUT_DEBOUNCE_)
      .filter(([_, status]) => status === VALID)
      .map(([formData, _]) => formData)
      .subscribe(({title, description, utc_timestamp, duration}) => {
        debugger
        const annotation = {
          utc_timestamp: parseDuration(utc_timestamp),
          duration: parseDuration(duration),
          fields: {
            title,
            description
          }
        }

        this.onUpdate.emit({trackIndex: this.entry.trackIndex, index: this.index, annotation})
      })
  }

  ngOnChanges() {
    if(this.form !== null) {
      this.form.reset({
        'color': this.entry.color,
        'start': this.entry.annotation.utc_timestamp,
        'duration': this.entry.annotation.duration,
        'title': this.entry.annotation.fields.title,
        'description': this.entry.annotation.fields.description
      })
    }
  }
}
