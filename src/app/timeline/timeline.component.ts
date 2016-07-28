import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { TrackComponent } from './track';
import { PlayheadComponent } from './playhead';
import { CursorComponent } from './cursor';
import { HandlebarComponent } from './handlebar';
import { Timeline, Annotation } from '../shared/models';
import { ScrollZoom } from './scroll-zoom.directive';
import { TimeService } from '../shared/time.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Project } from '../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [HandlebarComponent, TrackComponent, PlayheadComponent, CursorComponent, ScrollZoom]
})
export class TimelineComponent implements OnInit {

  @Input() data:Timeline;

  scrollLeft;
  scrollWidth;

  cursorTime;
  cursorDisplayTime;

  playheadTime = 2;
  playheadDisplayTime = 2;

  constructor(private el:ElementRef, private timeService:TimeService, private store:Store<Project>) {}

  ngOnInit() {
    // TODO: need to use setTimeout here, otherwise width = 0
    setTimeout(() => {
      Observable.fromEvent(window, 'resize')
      .startWith(null)
      .map(() => this.el.nativeElement.offsetWidth)
      .subscribe( (width) => {
        this.timeService.setTimelineViewportWidth(width);
      });
    }, 0);
  }

  scrollbarDrag(event) {
    this.scrollLeft = event.left;
    this.scrollWidth = event.width;
  }

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


  // deselect all annotations
  deselectAnnotations(){
    // dispatch
    this.store.dispatch({ type: 'DESELECT_ANNOTATIONS' });
  }

}
