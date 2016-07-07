import { Component, AfterViewInit } from '@angular/core';

import * as localforage from 'localforage';
import { provideStore } from '@ngrx/store';

import { Project } from './models';
import mockData from './mock-data';

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

  projectData:Project;
  title = 'app works!';
  videoSrc;

  constructor(private backend:SimpleBackendService) {
    log.debug('app component');

    // get mock data
    this.projectData = mockData;
    log.debug('data retrieved', this.projectData);
    this.videoSrc = this.projectData.video.url;

    // this.backend.retrieveVideo().then(blob => {
    //   this.videoSrc = URL.createObjectURL(blob);
    //   log.info('video retrieved:', blob);
    // }).catch(err => {
    //   log.error('retrieve video:', err);
    // });
  }

  ngAfterViewInit() {
    log.debug("app after view init");
    $(document).foundation();
  }

  videoFilePicked(event) {
    log.info('video file picked:', event);
    this.videoSrc = URL.createObjectURL(event.file);

    let meta = {
      name: event.file.name,
      type: event.file.type,
      size: event.file.size,
      lastModified: event.file.lastModified,
      lastModifiedDate: event.file.lastModifiedDate
    };
    this.backend.storeVideo(event.file, meta).then((result) => {
      log.debug('video stored:', result);
    }).catch(err => {
      log.error('store video:', err);
    });
  }
}
