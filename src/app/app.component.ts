import { Component, AfterViewInit } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs';

import { stubReducer } from './reducers';
import { Project, Annotation } from './shared/models';
import mockData from './shared/mock-data';

import * as localforage from 'localforage';
// import { BackendService } from './backend';
import { LocalStorageService, SimpleBackendService } from './backend';

import { VideoComponent } from './video';
import { InspectorComponent } from './inspector';
import { TimelineComponent } from './timeline';
import { FilepickerComponent, InfoComponent, IoComponent } from './project-handling';

declare var $:any;


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent, FilepickerComponent, InfoComponent, IoComponent],
  providers: [provideStore({stubReducer}, mockData), LocalStorageService, SimpleBackendService]
})
export class AppComponent implements AfterViewInit {

  videoSrc:Observable<any>;
  inspectorEntries:Observable<any>;

  constructor(private store:Store<Project>) {
    log.debug('app component');

    this.videoSrc = store.select('video', 'url');

    this.inspectorEntries = store.select(data => {
      return data.timeline.tracks.reduce((annotations, track) => {
        return annotations.concat(track.annotations);
      }, []);
    });

    // log.debug(store);

    // this.inspectorEntries.subscribe(entries => {
    //   log.debug(entries);
    // });

    // this.store.subscribe(data => {
    //   log.debug(data);
    // });

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
    // this.videoSrc = URL.createObjectURL(event.file);
    //
    // let meta = {
    //   name: event.file.name,
    //   type: event.file.type,
    //   size: event.file.size,
    //   lastModified: event.file.lastModified,
    //   lastModifiedDate: event.file.lastModifiedDate
    // };
    // this.backend.storeVideo(event.file, meta).then((result) => {
    //   log.debug('video stored:', result);
    // }).catch(err => {
    //   log.error('store video:', err);
    // });
  }
}
