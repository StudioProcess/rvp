import { Component, OnInit, Input } from '@angular/core';
import { TrackComponent } from './track/track.component';
import { PlayheadComponent } from './playhead/playhead.component';
import { CursorComponent } from './cursor/cursor.component';
import { AnnotationComponent } from './track/annotation/annotation.component';
import { Annotation } from '../models/models';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [TrackComponent, PlayheadComponent, CursorComponent, AnnotationComponent]
})
export class TimelineComponent implements OnInit {

  title = 'timeline works!';
  @Input() duration:number;

  cursorTime;
  cursorDisplayTime;

  playheadTime = 2;
  playheadDisplayTime = 2;

  annotation:Annotation = {
    utc_timestamp: 10,
    duration: 5,
    fields:{
      title: "Titel of Annotation",
      description: "dancer enters stage"
    }
  };

  moveCursor($moveEvent) {

    function extround(myvalue,n) {
      myvalue = (Math.round(myvalue * n) / n);
      return myvalue;
    }

    this.cursorTime = $moveEvent.offsetX / $moveEvent.currentTarget.offsetWidth * 100,100;
    this.cursorDisplayTime = extround($moveEvent.offsetX / $moveEvent.currentTarget.offsetWidth * 100,100);
    //log.debug("offsetX",$event.offsetX, "targetWidth",$event.target.offsetWidth);
    //log.debug($event.currentTarget.className);
  }

  constructor() {
  }

  ngOnInit() {
  }

}
