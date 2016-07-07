import { Component, OnInit, Input } from '@angular/core';
import { Annotation } from '../../../models/models';

@Component({
  moduleId: module.id,
  selector: 'app-annotation',
  templateUrl: 'annotation.component.html',
  styleUrls: ['annotation.component.css']
})

export class AnnotationComponent implements OnInit {

  @Input() data:Annotation;
  @Input() event:Event;

  constructor() {}

  ngOnInit() {
  }

  moveCursor($event) {
    log.debug($event);
    $event.stopPropagation();
  }
}
