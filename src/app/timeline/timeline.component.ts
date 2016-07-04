import { Component, OnInit } from '@angular/core';
import { TrackComponent } from './track/track.component';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css'],
  directives: [TrackComponent]
})
export class TimelineComponent implements OnInit {

  title = 'timeline works!';

  constructor() {}

  ngOnInit() {
  }

}
