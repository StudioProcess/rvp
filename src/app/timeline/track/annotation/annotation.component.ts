import { Component, OnInit, Input, Inject, forwardRef } from '@angular/core';
import { TimelineComponent } from '../../timeline.component';
import { Annotation, Timeline } from '../../../shared/models';
import { HandlebarComponent } from '../../handlebar/handlebar.component';

@Component({
  moduleId: module.id,
  selector: 'app-annotation',
  templateUrl: 'annotation.component.html',
  styleUrls: ['annotation.component.css'],
  directives: [HandlebarComponent]
  // providers: [TimelineComponent]
})

export class AnnotationComponent implements OnInit {

  @Input() data:Annotation;
  @Input() backcolor:string;

  timeline:TimelineComponent;
  timestamp:number;
  duration:number;
  handlebar:HandlebarComponent;

  constructor(@Inject(forwardRef(() => TimelineComponent)) timeline) {
    this.timeline = timeline;
  }

  ngOnInit() {
    this.timestamp = this.data.utc_timestamp / this.timeline.data.duration * 100;
    if (this.data.duration == 0) {
      this.duration = 0.1;
    } else {
      this.duration = this.data.duration / this.timeline.data.duration * 100;
    }

    log.debug('timeline duration', this.timeline.data.duration, 'annotation', this.timestamp, this.duration);
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
