import { Component, OnInit, AfterViewInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';

/**
 * NOTE (09/2017): @types/video.js only offers ambient declarations for video.js 5.16.
 * Therefore, a short ambient module is declared in src/types/declarations.d.ts,
 *  declaring all imports from 'video.js' explicitly as any.
 */ 
import videojs from 'video.js'

import { Observable } from 'rxjs/Rx';
import { PlayerService } from '../shared/player.service';

@Component({
  selector: 'app-video',
  templateUrl: 'video.component.html',
  styleUrls: ['video.component.scss']
})
export class VideoComponent implements OnInit, AfterViewInit {

  private player; // VideoJS Player instance
  private playerReady; // Promise that resolves when player is ready
  private playerOptions = {}; // Options to pass to VideoJS player
  private timeupdateRate = 30; // in milliseconds

  // emits player time updates (in seconds)
  @Output() timeupdate = new EventEmitter<number>();
  @Output() videoLoaded = new EventEmitter<any>(); // TODO: use proper Type

  @Input() set videoSrc(src) {
    this.playerReady.then(() => {
      // TODO: Updated videojs. Doesn't work without type anymore. Harcoded for now.
      // this.player.src(src); // NOTE: VIDEOJS: ERROR: (CODE:4 MEDIA_ERR_SRC_NOT_SUPPORTED) No compatible source was found for this media.
      this.player.src({src: src, type: 'video/mp4'});
    });
  }

  @Input() fileMetadata;

  get videoSrc() {
    if (this.player) {
      return this.player.currentSrc();
    }
    return null;
  }

  constructor(public hostElement: ElementRef, private playerService:PlayerService) {
    let resolveFn;
    this.playerReady = new Promise(function(resolve) {
      resolveFn = resolve;
    });
    this.playerReady.resolve = resolveFn;
  }

  ngOnInit() {
    this.player = videojs('videojs', this.playerOptions, () => {
      // player ready (callback has no args)
      log.debug('player ready');
      this.fitPlayer();
      window.addEventListener('resize', this.fitPlayer.bind(this));
      this.setupRequestHandling();
      this.player.on('loadedmetadata', this.onMetadataLoaded.bind(this));
      this.playerReady.resolve();
    });

    // setup player event streams
    const el = this.hostElement.nativeElement.querySelector('video'); // player/video DOM element
    const play$ = Observable.fromEvent(el, 'play');
    const pause$ = Observable.fromEvent(el, 'pause');
    const seeking$ = Observable.fromEvent(el, 'seeking');

    // emit events when the current player time should be polled
    const pollStream = play$.flatMapTo(
      Observable.interval(this.timeupdateRate).takeUntil(pause$) // emits poll events until player pauses
    ).merge(seeking$).throttleTime(this.timeupdateRate*0.9);
    // emit updated times on this stream
    const timeupdateStream = pollStream.map(() => this.player.currentTime()).distinctUntilChanged();
    // forward to output
    timeupdateStream.subscribe(this.timeupdate);
    // this.timeupdate.subscribe((time) => { log.debug('time updated', time) }); // test
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   window.addEventListener('load', this.fitPlayer.bind(this));
    //   document.addEventListener('DOMContentLoaded', this.fitPlayer.bind(this));
    //   // log.warn('ngAfterViewInit: calling fitPlayer');
    //   // this.fitPlayer();
    // }, 0);
  }

  // fit player to available space (use on window resize)
  private fitPlayer() {
    let elementDim = this.hostElement.nativeElement.getBoundingClientRect();
    // this.player.dimensions(elementDim.width, elementDim.height);
    this.player.dimensions(elementDim.width, 450);
    log.warn('fitting player: ', elementDim.width, elementDim.height);
  }

  private setupRequestHandling() {
    this.playerService.actionStream.subscribe(action => {
      switch (action.type) {
        case 'setTime':
          this.player.currentTime(action['time']);
          break;
        case 'play':
          this.player.play();
          break;
        case 'pause':
          this.player.pause();
          break;
        case 'toggle':
          if (this.player.paused()) { this.player.play(); }
          else { this.player.pause(); }
          break;
        case 'reset':
          this.player.reset();
          break;
      }
    });
  }

  private onMetadataLoaded() {
    let metadata = {
      type: this.player.currentType(),
      src: this.player.currentSrc(),
      duration: this.player.duration(),
      width: this.player.videoWidth(),
      height: this.player.videoHeight(),
      file: this.fileMetadata
    };
    this.videoLoaded.emit(metadata);
    this.playerService.videoLoaded(metadata);
    // log.debug('video loaded', metadata);
  }

  /*
    Video.js Player API: http://docs.videojs.com/docs/api/player.html
    - currentTime( seconds ) : Get or set the current time (in seconds)

    - currentType() : Get the current source type e.g. video/mp4
    - currentSrc() : Returns the fully qualified URL of the current source value e.g. http://mysite.com/video.mp4
    - duration() : Get the length in time of the video in seconds
    - videoWidth() : Get video width
    - videoHeight() : Get video height

    - pause()
    - paused()
    - play()

    Events: http://docs.videojs.com/docs/api/player.html#Eventsended
    - play
    - pause
    - seeking
    - seeked
    - ended : Fired when video playback ends
    - error : Fired when an error occurs
    - loadeddata : Fired when the player has downloaded data at the current playback position
    - loadedmetadata : Fired when the player has initial duration and dimension information
    - timeupdate : Fired when the current playback position has changed. During playback this is fired every 15-250 milliseconds, depending on the playback technology in use
    - useractive : Fired when the user is active, e.g. moves the mouse over the player
    - userinactive : Fired when the user is inactive, e.g. a short delay after the last mouse move or control interaction
    - volumechange : Fired when the volume changes
   */
}
