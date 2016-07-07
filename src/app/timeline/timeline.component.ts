import { Component, OnInit, Input } from '@angular/core';
import { TrackComponent } from './track/track.component';
import { PlayheadComponent } from './playhead/playhead.component';
import { AnnotationComponent } from './track/annotation/annotation.component';
import { Annotation } from '../models/models';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [TrackComponent, PlayheadComponent, AnnotationComponent]
})
export class TimelineComponent implements OnInit {

  title = 'timeline works!';
  @Input() duration:number;
  playheadTime;

  annotation:Annotation = {
    utc_timestamp: 10,
    duration: 5,
    fields:{
      title: "Titel of Annotation",
      description: "dancer enters stage"
    }
  };

  moveCursor($event) {
    this.playheadTime = $event.offsetX / $event.target.offsetWidth * 100;
    //log.debug("offsetX",$event.offsetX, "targetWidth",$event.target.offsetWidth);
    log.debug($event.target);
  }

  constructor() {
  }

  ngOnInit() {
  }

}
