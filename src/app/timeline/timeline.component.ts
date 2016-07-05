import { Component, OnInit, Input } from '@angular/core';
import { TrackComponent } from './track/track.component';
import { PlayheadComponent } from './playhead/playhead.component';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [TrackComponent, PlayheadComponent]
})
export class TimelineComponent implements OnInit {

  title = 'timeline works!';
  @Input() duration:number;

  constructor() {}

  ngOnInit() {
  }

}
