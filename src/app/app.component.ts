import { Component, AfterViewInit } from '@angular/core';
import {TimelineComponent} from './timeline/timeline.component';
import {InspectorComponent} from './inspector/inspector.component';
import {VideoComponent} from './video/video.component';
declare var $:any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent]
})
export class AppComponent implements AfterViewInit {
  title = 'app works!';
  constructor() {
    console.log("app component");
  }

  ngAfterViewInit() {

    console.log("app after view init");
    $(document).foundation();
  }
}
