import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs';

import { masterReducer } from './reducers';
import { Project, InspectorEntry, Timeline } from './shared/models';
import { getEmptyData, getTutorialData, getMockData, getRulerData } from './shared/datasets';

import { TimelineService, PlayheadService, PlayerService, InspectorService } from './shared';
import { SimpleBackendService, ProjectIOService } from './backend';

import { VideoComponent } from './video';
import { InspectorComponent } from './inspector';
import { TimelineComponent } from './timeline';
import { HandlebarComponent } from './timeline/handlebar';
import { ProjectHandlerComponent } from './project-handler';

import { KeyDirective } from './shared/key.directive';

declare var $:any;


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [TimelineComponent, InspectorComponent, VideoComponent, HandlebarComponent, KeyDirective, ProjectHandlerComponent],
  providers: [provideStore(masterReducer, getEmptyData()), TimelineService, PlayheadService, PlayerService, SimpleBackendService, ProjectIOService, InspectorService]
})
export class AppComponent implements OnInit, AfterViewInit {

  _videoSrc: string;
  _videoFile: Blob;
  inspectorEntries:Observable<InspectorEntry[]>;
  timelineData:Observable<Timeline>;
  @ViewChild(VideoComponent) private video:VideoComponent; // inject video component child (available AfterViewInit)

  set videoFile(file: Blob) {
    this._videoSrc = URL.createObjectURL(file);
    this._videoFile = file;
  }

  constructor(
    private timeService:TimelineService,
    private playheadService:PlayheadService,
    private playerService:PlayerService,
    private store:Store<Project>,
    private backendService:SimpleBackendService,
    private el:ElementRef,
    private projectIO:ProjectIOService
  ) {
    log.debug('app component');

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

    // setup state persistence
    // (skip initial state and hydration)
    store.skip(2).subscribe( data => {
      this.backendService.storeData(data).then((...args) => {
        log.debug("state saved", args);
      });
    });

    this.backendService.hasData().then(hasData => {
      if (hasData) {
        // load video data
        this.backendService.retrieveVideo().then(blob => {
          log.debug('video retrieved', blob);
          if (blob) { this.videoFile = blob; }
        });
        // load state data and hydrate state
        // this.backendService.clearData();
        this.backendService.retrieveData().then( data => {
          if (data != null) store.dispatch( {type: 'HYDRATE', payload: data} );
        });
      } else {
        log.debug('no local data');
      }
    });

  }

  ngOnInit() {
    log.debug('app init');

    let td;
    this.timelineData.first().subscribe(t => td=t.duration);
    log.debug('timeline duration', td);

    // initialize time service
    this.timeService.init({
      timelineDuration: td,
      viewportWidth: 1000, // inital value, will be set correctly by timeline component
      zoom: 1.0,
      scroll: 0.0
    });

    log.debug('timeline width', this.timeService.timelineWidth);

    // let at = this.el.nativeElement.querySelector('app-timeline');
    // let ac = this.el.nativeElement.querySelector('.scrollbar');
    // log.debug('app-timeline', at);
    // log.debug('.timeline', ac);

    window.addEventListener( 'keydown', this.handleHotkeys.bind(this) );
  }

  ngAfterViewInit() {
    log.debug("app after view init");
    $(document).foundation();

    // this.video.timeupdate.subscribe((time) => { log.debug(time) });
  }


  onVideoTimeupdate(time) {
    this.playheadService.time = time;
    //log.debug('video time updated:', time);
  }

  onVideoLoaded(metadata) {
    log.debug('video loaded', metadata);
    if (metadata.duration) {
      this.timeService.timelineDuration = metadata.duration;
      this.store.dispatch( {type:'SET_TIMELINE_DURATION', payload:metadata.duration} );
    }
  }

  // deselect all annotations
  deselectAnnotations(){
    // dispatch
    this.store.dispatch({ type: 'DESELECT_ANNOTATIONS' });
  }

  // Global hotkeys
  handleHotkeys(e) {
    // log.debug('keydown', e.keyCode, e.key);
    if (e.keyCode == 8) { // BACKSPACE
      e.preventDefault();
      this.store.dispatch( { type: 'DELETE_SELECTED_ANNOTATION' } );
    } else if (e.keyCode == 187 || e.keyCode == 221) { // + or ]
      e.preventDefault();
      this.store.dispatch( { type: 'ADD_TRACK'} );
    } else if (e.keyCode == 32) { // SPACE
      this.playerService.toggle();
      e.preventDefault();
    }
  }

  // compare function to sort entries by timestamp
  private compareEntries(a:InspectorEntry, b:InspectorEntry):number {
    return a.annotation.utc_timestamp - b.annotation.utc_timestamp;
  }

  // Reset button clicked in Project modal window
  onProjectReset() {
    this.playerService.reset(); // reset player
    this.backendService.clearVideo(); // clear video from storage
    this.store.dispatch( {type: 'HYDRATE', payload: getTutorialData()} );
  }

  // Export button clicked in Project modal window
  onProjectExport() {
    log.debug('app project export');
    this.store.first().subscribe(data => {
      this.projectIO.export(data, this._videoFile);
    });
  }

  // Import file selected in Project modal window
  onProjectImport(file: File) {
    log.debug('app project import', file);
    this.projectIO.import(file).then( ({data, videoBlob}) => {
      log.debug('imported', data, videoBlob);
      if (data) { this.store.dispatch( {type:'HYDRATE', payload:data} ) };
      if (videoBlob) { this.videoFile = videoBlob; }
    }).catch(err => {
      log.trace(err);
    });
  }

  // Video file selected in Project modal window
  onVideoFileOpened(file: File) {
    log.debug('app video file openend', file);
    this.videoFile = file;
    this.backendService.storeVideo(file).then(() => {
      log.debug('video stored');
    });
  }

}
