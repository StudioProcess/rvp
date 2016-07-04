import { Component, AfterViewInit } from '@angular/core';

// import { BackendService } from './backend/backend.service';
import { LocalStorageService } from './backend/local-storage.service';
import { SimpleBackendService } from './backend/simple-backend.service';

import { TimelineComponent } from './timeline/timeline.component';
import { InspectorComponent } from './inspector/inspector.component';
import { VideoComponent } from './video/video.component';
import { FilepickerComponent } from './filepicker/filepicker.component';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { ProjectIoComponent } from './project-io/project-io.component';

declare var $:any;


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent, FilepickerComponent, ProjectInfoComponent, ProjectIoComponent],
  providers: [LocalStorageService, SimpleBackendService]
})
export class AppComponent implements AfterViewInit {

  title = 'app works!';
  videoSrc = 'http://www.sample-videos.com/video/mp4/240/big_buck_bunny_240p_1mb.mp4';

  constructor(private backend:SimpleBackendService) {
    console.log("app component");

    this.backend.retrieveVideo().then(blob => {
      this.videoSrc = URL.createObjectURL(blob);
    });
  }

  ngAfterViewInit() {
    console.log("app after view init");
    $(document).foundation();
  }

  videoFilePicked(event) {
    console.log('video file picked:', event);
    this.videoSrc = URL.createObjectURL(event.file);

    let meta = {
      name: event.file.name,
      type: event.file.type,
      size: event.file.size,
      lastModified: event.file.lastModified,
      lastModifiedDate: event.file.lastModifiedDate
    };
    this.backend.storeVideo(event.file, meta).then((result) => {
      console.log('video stored', result);
    });
  }
}
