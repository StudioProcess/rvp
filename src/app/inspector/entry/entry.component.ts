import { Component, OnInit, Input } from '@angular/core';
import { InspectorEntry } from '../../shared/models';

@Component({
  moduleId: module.id,
  selector: '[app-entry]',
  templateUrl: 'entry.component.html',
  styleUrls: ['entry.component.css']
})
export class EntryComponent implements OnInit {

  @Input() data:InspectorEntry;

  constructor() {
  }

  ngOnInit() {
  }

}
