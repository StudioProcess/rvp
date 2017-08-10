/* TODO: currently unused, remove */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

// Initialization object needed to create a TimeService instance
// (Essentially constructor params)
interface TimeServiceInitialValues {
  timelineDuration: number;
  timelineViewportWidth: number;
  zoomLevel: number;
  maxZoomLevel: number;
  scrollPosition: number;
}


@Injectable()
export class TimeService {

  private _timelineDuration: BehaviorSubject<number>;
  private _timelineViewportWidth: BehaviorSubject<number>;
  private _timelineWidth: BehaviorSubject<number>;
  private _zoomLevel: BehaviorSubject<number>;
  private _scrollPosition: BehaviorSubject<number>;

  private _minZoomLevel: number;
  private _maxZoomLevel: number;

  // Observable Outputs
  timelineDurationStream: Observable<number>; // broadcast
  timelineViewportWidthStream: Observable<number>; // broadcast
  timelineWidthStream: Observable<number>;
  zoomLevelStream: Observable<number>; // can also change on viewport resize
  scrollPositionStream: Observable<number>; // can also change on viewport resize

  constructor() {}

  init(initial: TimeServiceInitialValues) {
    // set independent vars
    this._timelineDuration = new BehaviorSubject(initial.timelineDuration);
    this._timelineViewportWidth = new BehaviorSubject(initial.timelineViewportWidth);
    // (these are actually only semi-independent)
    this._zoomLevel = new BehaviorSubject(initial.zoomLevel);
    this._scrollPosition = new BehaviorSubject(initial.scrollPosition);

    // set dependent vars
    this._timelineWidth = new BehaviorSubject(initial.timelineDuration*initial.zoomLevel);
    this._minZoomLevel = initial.timelineViewportWidth / initial.timelineDuration;
    this._maxZoomLevel = initial.maxZoomLevel;
    this.zoomLevel = initial.zoomLevel;

    // 'export' public streams
    this.timelineDurationStream = this._timelineDuration.asObservable();
    this.timelineViewportWidthStream = this._timelineViewportWidth.asObservable();
    this.timelineWidthStream = this._timelineWidth.asObservable();
    this.zoomLevelStream = this._zoomLevel.asObservable();
    this.scrollPositionStream = this._scrollPosition.asObservable().distinctUntilChanged();

    log.debug('time service initialized', initial, this);
  };

  // Set timeline duration [s] (> 0)
  // => Broadcasts:
  //    New timeline duration (timelineDuration)
  //    New timeline width [px] (timelineWidth)
  set timelineDuration(duration: number) {
    if (duration <= 0) throw new Error('Invalid timeline duration. (Needs to be > 0)');
    this._timelineDuration.next(duration);
    // if (!this._zoomLevel.value) return;
    this._timelineWidth.next(duration * this._zoomLevel.value);
  }

  get timelineDuration() {
    return this._timelineDuration.value;
  }

  // Set zoom level [px/s] (> 0)
  // => Broadcasts:
  //    New zoom level (zoomLevel)
  //    New timeline width [px] (timelineWidth)
  set zoomLevel(zoom: number) {
      log.debug('setting zoom level', zoom);
    // if (zoom <= 0) throw new Error('Invalid zoom level. (Needs to be > 0)');
    // TODO: enable error checking
    if (zoom <= 0) return;
    if (this._minZoomLevel && zoom < this._minZoomLevel) { zoom = this._minZoomLevel; }
    else if (this._maxZoomLevel && zoom > this._maxZoomLevel) { zoom = this._maxZoomLevel; }
    this._zoomLevel.next(zoom);
    // if (!this._timelineDuration.value) return;
    this._timelineWidth.next(zoom * this._timelineDuration.value);
  }

  get zoomLevel() {
    return this._zoomLevel.value;
  }

  // Set zoom level [%] (0,1)
  set zoomLevelRelative(percent: number) {
    log.debug('setting zoom level (relative)', percent);
    this.zoomLevel =  (1-percent) * (this._maxZoomLevel - this._minZoomLevel);
  }

  get zoomLevelRelative() {
    return 1 - this._zoomLevel.value / (this._maxZoomLevel - this._minZoomLevel);
  }

  set scrollPosition(scroll: number) {
    log.debug('setting scroll position', scroll);
    if (scroll < 0) { scroll = 0; }
    else if (scroll > this._timelineWidth.value) { scroll = this._timelineWidth.value; }
    this._scrollPosition.next(scroll);
  }

  get scrollPosition() {
    return this._scrollPosition.value;
  }

  set scrollPositionRelative(percent: number) {
    log.debug('setting scroll position (relative)', percent);
    if (percent < 0) { percent = 0; }
    else if (percent > 100) { percent = 100; }
    this._scrollPosition.next(percent * this._timelineWidth.value);
  }

  get scrollPositionRelative() {
    return this._scrollPosition.value / this._timelineWidth.value;
  }

  // Set width of visible part of timeline (viewport) [px] (> 0)
  // => Broadcasts:
  //    New viewport width (timelineViewportWidth)
  //    New zoom level [px/s] (zoomLevel)
  // => Calculates: new minimum zoom level
  setTimelineViewportWidth(width: number) {
    log.debug('setting viewport width', width);
    if (width <= 0) throw new Error('Invalid viewport width. (Needs to be > 0)');
    this._timelineViewportWidth.next(width);

    // Adjust min zoom level to new width
    // if (!this._minZoomLevel || !this._timelineDuration) return;
    let minZoomOld = this._minZoomLevel;
    this._minZoomLevel = width / this._timelineDuration.value;
    let minZoomNew = this._minZoomLevel;

    // Interpolate new zoom level
    // if (!this._zoomLevel.value) return;
    let zoomOld = this._zoomLevel.value;
    let maxZoom = this._maxZoomLevel;
    let scale = (zoomOld-minZoomOld) / (maxZoom - minZoomOld);
    let zoomNew = scale * (maxZoom - minZoomNew);
    this.zoomLevel = zoomNew;
  }

  get timelineViewportWidth() {
    return this._timelineViewportWidth.value;
  }

  get timelineWidth() {
    return this._timelineWidth.value;
  }


  // Conversion Functions (one time)
  convertPixelsToSeconds(px: number): number {
    return px / this._zoomLevel.value;
  }

  convertPercentToSeconds(percent: number): number {
    return this.convertPixelsToSeconds(percent * this.timelineWidth);
  }

  convertSecondsToPixels(s:number): number {
    return s * this._zoomLevel.value;
  }

  convertSecondsToPercent(s:number): number {
    return this.convertSecondsToPixels(s) / this.timelineWidth;
  }

  convertViewportPixelsToSeconds(px:number): number {
    return  this.convertPixelsToSeconds(this._scrollPosition.value + px);
  }

  // Streaming Conversion Functions
  convertPixelsToSecondsStream(px: number): Observable<number> {
    return this.zoomLevelStream.map( zoomLevel => px / zoomLevel );
  }

  convertSecondsToPixelsStream(s: number): Observable<number> {
    return this.zoomLevelStream.map( zoomLevel => s * zoomLevel );
  }

}
