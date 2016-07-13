import { Component, OnInit, Input } from '@angular/core';
import { EntryComponent } from './entry';
import { Annotation } from '../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css'],
  directives: [EntryComponent]
})
export class InspectorComponent implements OnInit {
  @Input() entries:any[];

  // entry:Annotation = {
  //   utc_timestamp: 3234,
  //   duration: 1,
  //   fields:{
  //     title: "Titel of Annotation",
  //     description: "dancer enters stage"
  //   }
  // };

  // constructor() {
  //   this.entries.push(this.entry);
  //   this.entries.push(this.entry);
  //   this.entries.push(this.entry);
  //   this.entries.push(this.entry);
  //   this.entries.push(this.entry);
  //   this.entries.push(this.entry);
  // }

  constructor() {
  }

  ngOnInit() {
  }

}
