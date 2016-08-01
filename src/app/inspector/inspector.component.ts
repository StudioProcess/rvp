import { Component, OnInit, Input } from '@angular/core';
import { EntryComponent } from './entry';
import { InspectorEntry } from '../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css'],
  directives: [EntryComponent]
})
export class InspectorComponent implements OnInit {

  @Input() entries:InspectorEntry[];

  constructor() { }

  ngOnInit() { }

}
