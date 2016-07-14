import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs';

import { stubReducer } from './reducers';
import { Project, InspectorEntry, Timeline } from './shared/models';
import mockData from './shared/mock-data';

import * as localforage from 'localforage';
// import { BackendService } from './backend';
import { LocalStorageService, SimpleBackendService } from './backend';

import { VideoComponent } from './video';
import { InspectorComponent } from './inspector';
import { TimelineComponent } from './timeline';
import { FilepickerComponent, InfoComponent, IoComponent } from './project-handling';
import { HandlebarComponent } from './timeline/handlebar';

declare var $:any;


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent, FilepickerComponent, InfoComponent, IoComponent, HandlebarComponent],
  providers: [provideStore({stubReducer}, mockData), LocalStorageService, SimpleBackendService]
})
export class AppComponent implements AfterViewInit {

  videoSrc:Observable<string>;
  inspectorEntries:Observable<InspectorEntry[]>;
  timelineData:Observable<Timeline>;
  @ViewChild(VideoComponent) private video:VideoComponent; // inject video component child (available AfterViewInit)

  constructor(private store:Store<Project>) {
    log.debug('app component');

    // video data
    this.videoSrc = store.select('video', 'url') as Observable<string>;

    // inspector data
    this.inspectorEntries = store.select(state => {
      return state.timeline.tracks.reduce( (acc, track) => {
        // map annotations to [ [annotation, color], ...]
        let color = track.color;
        let annotationsWithColor = track.annotations.map(annotation => {
          return {annotation, color}; });
        acc = acc.concat(annotationsWithColor);
        acc.sort(this.compareEntries);
        return acc;
      }, [] );
    });
    // this.inspectorEntries.subscribe((data) => { log.debug(data); })

    // timeline data
    this.timelineData = store.select('timeline') as Observable<Timeline>;

    // this.timelineData.subscribe(data => {
    //   log.debug('timeline data', data);
    // })

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

    // this.video.timeupdate.subscribe((time) => { log.debug(time) });
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

  onVideoTimeupdate(time) {
    log.debug('video time updated:', time);
  }

  // compare function to sort entries by timestamp
  private compareEntries(a:InspectorEntry, b:InspectorEntry):number {
    return a.annotation.utc_timestamp - b.annotation.utc_timestamp;
  }
}
