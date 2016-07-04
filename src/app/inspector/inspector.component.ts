import { Component, OnInit } from '@angular/core';
import { InspectorentryComponent } from '../inspector-entry/inspector-entry.component';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css'],
  directives: [InspectorentryComponent]
})
export class InspectorComponent implements OnInit {

  title = 'inspector works!';

  constructor() {}

  ngOnInit() {
  }

}
