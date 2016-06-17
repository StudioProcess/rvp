import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.css']
})
export class TimelineComponent implements OnInit {

  title = 'timeline works!';

  constructor() {}

  ngOnInit() {
  }

}
