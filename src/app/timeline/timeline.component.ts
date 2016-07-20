import { Component, OnInit, Input } from '@angular/core';
import { TrackComponent } from './track';
import { PlayheadComponent } from './playhead';
import { CursorComponent } from './cursor';
import { HandlebarComponent } from './handlebar';
import { Timeline, Annotation } from '../shared/models';
import { ScrollZoom } from './scroll-zoom.directive';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [HandlebarComponent, TrackComponent, PlayheadComponent, CursorComponent, ScrollZoom]
})
export class TimelineComponent implements OnInit {

  @Input() data:Timeline;

  cursorTime;
  cursorDisplayTime;

  playheadTime = 2;
  playheadDisplayTime = 2;

  private static MAX_ZOOM = 100; // px/s
  private static TEST_ZOOM = 10; // px/s

  scrollLeft;
  scrollWidth;

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

  playheadClick($clickEvent) {

    function extround(myvalue,n) {
      myvalue = (Math.round(myvalue * n) / n);
      return myvalue;
    }

    this.playheadTime = $clickEvent.offsetX / $clickEvent.currentTarget.offsetWidth * 100,100;
    this.playheadDisplayTime = extround($clickEvent.offsetX / $clickEvent.currentTarget.offsetWidth * 100,100);

  }

  constructor() {
  }

  ngOnInit() {
  }

  scrollbarDrag(event) {
    this.scrollLeft = event.left;
    this.scrollWidth = event.width;
  }

}
