import { Component, OnInit, Input } from '@angular/core';
import { InspectorEntry } from '../../shared/models';
import { REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: '[app-entry]',
  templateUrl: 'entry.component.html',
  styleUrls: ['entry.component.css'],
  directives: [REACTIVE_FORM_DIRECTIVES]
})
export class EntryComponent implements OnInit {

  form:FormGroup;
  color:string;

  @Input() set data(entry:InspectorEntry) {
    this.color = entry.color;
    // TODO: update in RC5: use FormGroup.updateValue() to set all form values in one step
    (this.form.controls['timestamp'] as FormControl).updateValue(entry.annotation.utc_timestamp);
    (this.form.controls['duration'] as FormControl).updateValue(entry.annotation.duration);
    (this.form.controls['title'] as FormControl).updateValue(entry.annotation.fields.title);
    (this.form.controls['description'] as FormControl).updateValue(entry.annotation.fields.description);
  }

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      'timestamp': [null, Validators.required],
      'duration': [],
      'title': [],
      'description': []
    });

    // this.form.valueChanges.subscribe(x => log.debug('value changed:', x));
  }

  ngOnInit() {
    log.debug(this.form);
  }

}
