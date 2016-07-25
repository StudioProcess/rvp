import { Component, OnInit, Input } from '@angular/core';
import { InspectorEntry } from '../../shared/models';
import { REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TimePipe, UnixTimePipe } from '../../shared/time.pipes';

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
  formatTime = TimePipe.prototype.transform;
  timePattern = '([0-9]*:){0,2}[0-9]*(\\.[0-9]*)?'; // Validation pattern for HH:MM:SS.XXX
  timeRegExp = new RegExp('^' + this.timePattern + '$');

  @Input() set data(entry:InspectorEntry) {
    this.color = entry.color;
    // TODO: update in RC5: use FormGroup.updateValue() to set all form values in one step
    (this.form.controls['timestamp'] as FormControl).updateValue(this.formatTime(entry.annotation.utc_timestamp));
    (this.form.controls['duration'] as FormControl).updateValue(this.formatTime(entry.annotation.duration));
    (this.form.controls['title'] as FormControl).updateValue(entry.annotation.fields.title);
    (this.form.controls['description'] as FormControl).updateValue(entry.annotation.fields.description);
  }

  constructor(fb: FormBuilder) {
    let validateTime = Validators.pattern(this.timePattern);
    this.form = fb.group({
      'timestamp': [, [Validators.required, validateTime]],
      'duration': [, validateTime],
      'title': [],
      'description': []
    });

    // this.form.valueChanges.subscribe(x => log.debug('value changed:', x));
    this.form.controls['timestamp'].valueChanges.subscribe( x => log.debug('parsed timestamp:', UnixTimePipe.prototype.transform(x)) );
  }

  ngOnInit() {
  }

  // Guard against invalid time input
  timeInputGuard(e) {
    // for a keyCode return true if it's a printable key
    const isPrintable = k =>
      (k > 47 && k < 58) || // number keys
      (k == 32) || // spacebar
      (k == 13)  || // return key
      (k > 64 && k < 91) || // letter keys
      (k > 95 && k < 112) || // numpad keys
      (k > 185 && k < 193) || // ;=,-./` (in order)
      (k > 218 && k < 223); // [\]' (in order)

    if (!isPrintable(e.keyCode)) return; // allow non-printable keys

    let input = e.target; // the input element
    let value = input.value; // value of the input
    let newValue = value.slice(0, input.selectionStart) + e.key + value.slice(input.selectionEnd);
    // log.debug(newValue, this.timeRegExp.test(newValue));
    if ( !this.timeRegExp.test(newValue) ) e.preventDefault(); // block printable keys that make the value invalid
  }

}
