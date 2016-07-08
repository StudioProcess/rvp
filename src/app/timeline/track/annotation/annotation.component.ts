import { Component, OnInit, Input } from '@angular/core';
import { Annotation } from '../../../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-annotation',
  templateUrl: 'annotation.component.html',
  styleUrls: ['annotation.component.css']
})

export class AnnotationComponent implements OnInit {

  @Input() data:Annotation;
  @Input() backcolor:string;

  constructor() {}

  ngOnInit() {
  }

  hoverOver($hoverEvent){
    //this.backcolor = "#FF0000";
  }

  hoverOut($hoverEvent){
    //this.backcolor = "#FFFFFF";
  }

  moveCursor($moveEvent) {
    //log.debug($moveEvent);
    $moveEvent.stopPropagation();
  }

  clickAnnotation($clickEvent){
    $clickEvent.stopPropagation();
  }
}
