import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { TrackComponent } from './track';
import { PlayheadComponent } from './playhead';
import { CursorComponent } from './cursor';
import { HandlebarComponent } from './handlebar';
import { Timeline, Annotation } from '../shared/models';
import { ScrollZoom } from './scroll-zoom.directive';
import { TimeService } from '../shared/time.service';
import { PlayheadService } from '../shared/playhead.service';
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

  scrollbarLeft;
  scrollbarWidth;
  timelineWidth;

  cursorTime;
  cursorDisplayTime;

  playheadTime;
  playheadDisplayTime;

  constructor(private el:ElementRef, private timeService:TimeService, private store:Store<Project>, private playheadService:PlayheadService) {}

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

    this.timeService.timelineWidthStream.subscribe(width => this.timelineWidth = width);

    this.playheadService.timeStream.subscribe(time => {
      this.playheadDisplayTime = time;
    });

    this.playheadService.relativeStream.subscribe(relativePosition => {
      this.playheadTime = (relativePosition * 100); // TODO: use relative position instead of time
    });

    this.timeService.scrollPositionStream.subscribe(pos => {
      log.debug('scroll', pos);
    });
  }

  scrollbarDrag(event) {
    this.scrollbarLeft = event.left;
    this.scrollbarWidth = event.width;
    // set zoom level in time service
    this.timeService.scrollPositionRelative = event.left / 100;
    this.timeService.zoomLevelRelative = event.width / 100;
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

  addTrack(){
    this.store.dispatch( { type: 'ADD_TRACK'} );
  }

}
