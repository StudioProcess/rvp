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

  // Entry identity for tracking via ngFor
  // If the return value changes for an entry, it's DOM is recreated
  entryTrackingId(index, entry) {
    // Use annotation object reference, so the DOM is not changed due to a new InspectorEntry objects
    // TODO: Use a generated entry ID, or have the entries have persistence in the state
    return entry.annotation;
  }

}
