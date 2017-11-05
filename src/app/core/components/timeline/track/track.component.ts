import {Component, Input, ChangeDetectionStrategy, OnInit} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Track, Annotation} from '../../../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
})
export class TrackComponent implements OnInit {
  @Input() data: Track
  @Input() totalDuration: number

  form: FormGroup|null = null

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.fields.title, Validators.required]
    })
  }

  getAnnotationPosition(annotation: Annotation) {
    return annotation.utc_timestamp / this.totalDuration * 100
  }

  getAnnotationWidth(annotation: Annotation) {
    return annotation.duration / this.totalDuration * 100
  }
}
