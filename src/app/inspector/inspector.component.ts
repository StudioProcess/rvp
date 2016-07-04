import { Component, OnInit } from '@angular/core';
import { EntryComponent } from './entry/entry.component';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css'],
  directives: [EntryComponent]
})
export class InspectorComponent implements OnInit {

  title = 'inspector works!';

  constructor() {}

  ngOnInit() {
  }

}
