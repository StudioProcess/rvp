import {Component, Input, ChangeDetectionStrategy, OnInit} from '@angular/core'

import {FormGroup, FormBuilder, Validators} from '@angular/forms'

import {Track} from '../../../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  templateUrl: 'track.component.html'
})
export class TrackComponent implements OnInit {
  @Input() data: Track

  form: FormGroup|null = null

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      title: [this.data.fields.title, Validators.required]
    })
  }
}
