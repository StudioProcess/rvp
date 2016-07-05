import { Component, OnInit } from '@angular/core';
import { EntryComponent } from './entry/entry.component';
import { Annotation } from '../models/models';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css'],
  directives: [EntryComponent]
})
export class InspectorComponent implements OnInit {

  title = 'inspector works!';

  entry:Annotation = {
    utc_timestamp: 3234,
    duration: 1,
    fields:{
      title: "Titel of Annotation",
      description: "dancer enters stage"
    }
  };

  entries:Annotation[] = [];

  constructor() {
    this.entries.push(this.entry);
    this.entries.push(this.entry);
    this.entries.push(this.entry);
    this.entries.push(this.entry);
    this.entries.push(this.entry);
  }

  ngOnInit() {
  }

}
