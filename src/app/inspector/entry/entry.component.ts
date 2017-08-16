import { Component, OnInit, Input, ElementRef, HostBinding } from '@angular/core';
import { InspectorEntry, Annotation } from '../../shared/models';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TimePipe, UnixTimePipe, KeyDirective } from '../../shared';

import { Store } from '@ngrx/store';


@Component({
  selector: '[app-entry]',
  templateUrl: 'entry.component.html',
  styleUrls: ['entry.component.scss']
})
export class EntryComponent implements OnInit {

  @Input() @HostBinding('class.selected') isSelected:boolean;

  _data:InspectorEntry; // updated by data() setter
  form:FormGroup;
  formatTime = TimePipe.prototype.transform;
  parseTime = UnixTimePipe.prototype.transform;
  timePattern = '([0-9]*:){0,2}[0-9]*(\\.[0-9]*)?'; // Validation pattern for HH:MM:SS.XXX
  timeRegExp = new RegExp('^' + this.timePattern + '$');

  @Input() set data(entry:InspectorEntry) {
    this._data = entry;
    this.form.setValue({
      'timestamp': this.formatTime(entry.annotation.utc_timestamp),
      'duration': this.formatTime(entry.annotation.duration),
      'title': entry.annotation.fields.title,
      'description': entry.annotation.fields.description
    });
    
    // TODO: Remove the following. (Updated above to use FormGroup.setValue())
    // OLD NOTE: update in RC5: use FormGroup.updateValue() to set all form values in one step
    // (this.form.controls['timestamp'] as FormControl).updateValue(this.formatTime(entry.annotation.utc_timestamp));
    // (this.form.controls['duration'] as FormControl).updateValue(this.formatTime(entry.annotation.duration));
    // (this.form.controls['title'] as FormControl).updateValue(entry.annotation.fields.title);
    // (this.form.controls['description'] as FormControl).updateValue(entry.annotation.fields.description);
  }

  constructor(private hostElement: ElementRef, fb: FormBuilder, private store: Store<any>) {
    let validateTime = Validators.pattern(this.timePattern);
    this.form = fb.group({
      'timestamp': [, [Validators.required, validateTime]],
      'duration': [, validateTime],
      'title': [],
      'description': []
    });

    // this.form.valueChanges.subscribe(x => log.debug('value changed:', x));
    // this.form.controls['timestamp'].valueChanges.subscribe( x => log.debug('parsed timestamp:', UnixTimePipe.prototype.transform(x)) );

    // this.form.valueChanges.subscribe(x => log.debug('form value', x));
  }

  ngOnInit() {
  }

  stopPropagation(e){
    e.stopPropagation();
  }

  // Guard against invalid time input
  timeInputGuard(e) {
    // for a keyCode return true if it's a printable key
    const isPrintable = k =>
      (k > 47 && k < 58) || // number keys
      (k == 32) || // spacebar
      // (k == 13)  || // return key // don't count as printable, therefore don't guard against it
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

  blurOnReturnKey(e) {
    if (e.keyCode == 13) { // Enter/Return or Numpad Return Key
      e.stopPropagation(); // prevent bubbling to e.g. timeInputGuard
      e.target.blur(); // emits blur event which triggers submit()
    }
  }

  // Send updated values of this component
  submit(e) {
    if (this.form.dirty && this.form.valid) {
      // log.debug('submit', this.form.value);
      let newAnnotation:Annotation = {
        utc_timestamp: this.parseTime(this.form.value.timestamp),
        duration: this.parseTime(this.form.value.duration),
        fields: {
          title: this.form.value.title,
          description: this.form.value.description
        },
        isSelected: true
      };
      this.store.dispatch({
        type: 'UPDATE_ANNOTATION',
        payload: { old:this._data.annotation, new:newAnnotation }
      });
    }
  }

  selectAnnotation() {
    let newAnnotation:Annotation = this._data.annotation;
    if (newAnnotation.isSelected != true ) { // it's not already selected
      this.store.dispatch( {type: 'SELECT_ANNOTATION', payload: newAnnotation} );
    }
  }

}
