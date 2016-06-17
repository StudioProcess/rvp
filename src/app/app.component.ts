import { Component } from '@angular/core';
import * as $ from 'jquery';
import {TimelineComponent} from './timeline/timeline.component';
import {InspectorComponent} from './inspector/inspector.component';
import {VideoComponent} from './video/video.component';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent]
})
export class AppComponent {
  title = 'app works!';
  constructor() {
    // declare var document: any;
    console.log("app component");
    // console.log($());
    // declare var document:any;
    console.log(document);
  }
}
