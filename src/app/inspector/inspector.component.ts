import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { InspectorEntry } from '../shared/models';
import { InspectorService } from '../shared';

@Component({
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.scss'],
})
export class InspectorComponent implements OnInit {

  @Input() entries:InspectorEntry[];

  constructor(private el:ElementRef, inspectorService:InspectorService) {
    inspectorService.scrollToAnnotationStream.subscribe(annotation => this.scrollToAnnotation(annotation));
  }

  ngOnInit() { }

  // Entry identity for tracking via ngFor
  // If the return value changes for an entry, it's DOM is recreated
  entryTrackingId(entry: any) {
    // Use annotation object reference, so the DOM is not changed due to a new InspectorEntry objects
    // TODO: Use a generated entry ID, or have the entries have persistence in the state
    return entry.annotation;
  }

  scrollToAnnotation(annotation: any) {
    log.debug('scroll to', annotation);
    let idx = this.entries.findIndex(entry => entry.annotation === annotation)

    if(idx !== -1) {
      let node = this.el.nativeElement.querySelectorAll('div[app-entry]')[idx];
      let scrollContainer = this.el.nativeElement.querySelector('.scroll-container');
      log.debug('scroll to', node);
      let centerOffset = (scrollContainer.offsetHeight - node.offsetHeight) / 2;
      scrollContainer.scrollTop = node.offsetTop - scrollContainer.offsetTop - centerOffset;
    }
  }

}
