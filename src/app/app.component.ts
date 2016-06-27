import { Component, AfterViewInit } from '@angular/core';
import { TimelineComponent } from './timeline/timeline.component';
import { InspectorComponent } from './inspector/inspector.component';
import { VideoComponent } from './video/video.component';
import { BackendService } from './backend/backend.service';
import { FilepickerComponent } from './filepicker/filepicker.component';
declare var $:any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent, FilepickerComponent],
  providers: [BackendService]
})
export class AppComponent implements AfterViewInit {
  title = 'app works!';

  constructor(backend:BackendService) {
    console.log("app component");
    console.log(backend.blobStore);
  }

  ngAfterViewInit() {
    console.log("app after view init");
    $(document).foundation();
  }

  videoFilePicked(event) {
    console.log('app says:', event);
  }
}
