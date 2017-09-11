import { Component, OnInit, AfterViewInit} from '@angular/core';
import {Http} from '@angular/http'

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { State, InspectorEntry, Timeline, Project } from './shared/models';
import { getEmptyData/*, getTutorialData, getMockData, getRulerData */} from './shared/datasets';

import { TimelineService, PlayheadService, PlayerService } from './shared';
import { SimpleBackendService, ProjectIOService } from './backend';

import * as action from './actions'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  _videoSrc: string|null = null
  _videoFile: Blob|null = null

  // inspector data
  // TODO: this selector could be refactored using createSelector (to use memoization)
  // see: https://github.com/ngrx/platform/blob/master/docs/store/selectors.md
  inspectorEntries: Observable<InspectorEntry[]> = this.store.select(state => {
    if(state.project !== null) {
      const init: any[] = []
      return state.project.timeline.tracks.reduce( (acc, track) => {
        // map annotations to [ [annotation, color], ...]
        let color = track.color;
        let annotationsWithColor = track.annotations.map(annotation => ({annotation, color}))
        acc = acc.concat(annotationsWithColor);
        acc.sort(this.compareEntries);
        return acc;
      }, init);
    } else {
      return []
    }
  })

  timelineData: Observable<Timeline> = this.store.select('project', 'timeline')

  set videoFile(file: Blob) {
    this._videoSrc = URL.createObjectURL(file);
    this._videoFile = file;
  }

  constructor(
    private timeService: TimelineService,
    private playheadService: PlayheadService,
    private playerService: PlayerService,
    private store: Store<State>,
    private backendService: SimpleBackendService,
    private projectIO: ProjectIOService,
    private readonly http: Http) {}

  async ngOnInit() {
    // setup state persistence
    // (skip initial state and hydration)
    this.store.skip(2).subscribe( state => {
      this.backendService.storeData(state.project).then((...args: any[]) => {
        log.debug("state saved", args);
      });
    });

    try {
      const hasData = await this.backendService.hasData()
      if(hasData) {
        const retrievePromises: [Promise<Blob>, Promise<Project>] =
          [this.backendService.retrieveVideo(), this.backendService.retrieveData()]

        const [videoBlob, project] = await Promise.all(retrievePromises)

        if(videoBlob) {
          this.videoFile = videoBlob
        }
        if(project) {
          this.store.dispatch(new action.Hydrate(project))
        }
        this.hideLoadingOverlay()
      } else {
        log.debug('no local data, importing initial project');
        this.importProjectFromURL('assets/projects/initial.rv');
      }
    } catch(err) {
      log.error('error while fetching local data')
      log.trace(err)
    }

    log.debug('app init');

    let td = null;
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


  onVideoTimeupdate(time: any) {
    this.playheadService.time = time;
    //log.debug('video time updated:', time);
  }

  onVideoLoaded(metadata: any) {
    log.debug('video loaded', metadata);
    if (metadata.duration) {
      this.timeService.timelineDuration = metadata.duration;
      this.store.dispatch(new action.SetTimelineDuration(metadata.duration));
    }
  }

  // deselect all annotations
  deselectAnnotations(){
    // dispatch
    this.store.dispatch(new action.DeleteSelectedAnnotation());
  }

  // Global hotkeys
  handleHotkeys(e: KeyboardEvent) {
    // log.debug('keydown', e.keyCode, e.key);
    if (e.keyCode == 8) { // BACKSPACE
      e.preventDefault();
      this.store.dispatch(new action.DeleteSelectedAnnotation());
    } else if (e.keyCode == 187 || e.keyCode == 221) { // + or ]
      e.preventDefault();
      this.store.dispatch(new action.AddTrack());
    } else if (e.keyCode == 32) { // SPACE
      this.playerService.toggle();
      e.preventDefault();
    }
  }

  // compare function to sort entries by timestamp
  private compareEntries(a: InspectorEntry, b: InspectorEntry): number {
    if(a.annotation.utc_timestamp !== null && b.annotation.utc_timestamp !== null) {
      return a.annotation.utc_timestamp - b.annotation.utc_timestamp;
    } else if(a.annotation.utc_timestamp !== null) {
      return -1
    } else if(b.annotation.utc_timestamp !== null) {
      return 1
    } else {
      return 0
    }
  }

  // Reset button clicked in Project modal window
  onProjectReset() {
    this.showLoadingOverlay();
    this.playerService.reset(); // reset player
    this.backendService.clearVideo(); // clear video from storage
    this.backendService.clearData(); // clear data from storage
    this.store.dispatch(new action.Hydrate(getEmptyData()));
    this.importProjectFromURL('assets/projects/initial.rv');
  }

  // Export button clicked in Project modal window
  onProjectExport() {
    log.debug('app project export');
    this.store.first().subscribe(state => {
      if(state.project !== null && this._videoFile !== null) {
        this.projectIO.export(state.project, this._videoFile);
      }
    });
  }

  // Import file selected in Project modal window
  onProjectImport(file: File) {
    log.debug('app project import', file);
    this.projectIO.import(file).then( ({data, videoBlob}) => {
      log.debug('imported', data, videoBlob);
      if (data) { this.store.dispatch(new action.Hydrate(data)) };
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

  // Load project via HTTP GET from an url
  // TODO: return promise, so we can react when it's loaded
  async importProjectFromURL(url: string) {
    // TODO: fix pace not picking up this request properly
    let pace = window['Pace'];
    if(pace !== null) {
      console.log('restarting pace');
      pace.restart();
    }

    debugger
    try {
      const res = await this.http.get(url).toPromise()
      debugger
      const file = (new Blob([res], {type : 'application/zip'})) as File

      debugger

      const {data, videoBlob} = await this.projectIO.import(file)

      debugger
      if (data) {
        // this.store.dispatch(new action.Hydrate(data))
      }
      if (videoBlob) {
        // this.onVideoFileOpened(videoBlob)
      }

      this.hideLoadingOverlay()
    } catch(err) {
      log.trace(err)
    }


    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', url, true);
    // xhr.responseType = 'blob';
    // xhr.onload = () => {
    //   let blob = xhr.response;
    //   // log.debug(blob);
    //   this.projectIO.import(blob).then( ({data, videoBlob}) => {
    //     if (data) { this.store.dispatch(new action.Hydrate(data)) };
    //     if (videoBlob) { this.onVideoFileOpened(videoBlob); } // set and store video
    //   }).catch(err => {
    //     log.trace(err);
    //   }).then(() => {
    //     ;
    //   })
    // };
    // xhr.send();
  }

  // TODO: possibly put loading overlay functions in a service
  showLoadingOverlay() {
    const body = document.querySelector('body')
    if(body !== null) {
      body.classList.add('loading');
    }
  }

  hideLoadingOverlay() {
    const body = document.querySelector('body')
    if(body !== null) {
      body.classList.remove('loading');
    }

    const pace = document.querySelector('.pace')
    if(pace) {
      pace.classList.add('pace-inactive');
    }
  }
}
