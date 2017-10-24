import {
  Component, Input, Output,
  OnChanges, EventEmitter
} from '@angular/core'

import {FormGroup, FormBuilder} from '@angular/forms'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

import {AnnotationColorMap, Annotation} from '../../../persistence/model'

@Component({
  selector: 'rv-inspector-entry',
  template: `
    <form [formGroup]="form" novalidate>
      <div class="row collapse">
        <div class="column shrink">
          <div class="annotation-color" [style.backgroundColor]="entry.color"></div>
        </div>
        <div class="column">
          <input formControlName="title">
        </div>
      </div>
      <div class="row">
        <div class="column">
          <pre>{{form.value|json}}</pre>
          <pre>{{form.status|json}}</pre>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent implements OnChanges {
  @Input() entry: AnnotationColorMap
  @Input() index: number

  @Output() onUpdate = new EventEmitter<{index: number, annotation: Annotation}>()

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
      'start': utc_timestamp, duration,
      title, description
    }
  }

  ngOnInit() {
    this.form = this._fb.group(this._mapModel(this.entry))

    this.form.valueChanges
      .debounceTime(_FORM_INPUT_DEBOUNCE_)
      .subscribe(({title, description, start, duration}) => {
        const annotation = {
          utc_timestamp: start,
          duration,
          fields: {
            title,
            description
          }
        }

        this.onUpdate.emit({index: this.index, annotation})
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
