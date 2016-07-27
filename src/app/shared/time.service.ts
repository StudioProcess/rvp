import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';


interface TimeServiceOptions {
  timelineDuration: number;
  timelineViewportWidth: number;
  zoomLevel: number;
  maxZoomLevel: number;
}


@Injectable()
export class TimeService {

  private _timelineDuration: BehaviorSubject<number>;
  private _timelineViewportWidth: BehaviorSubject<number>;
  private _timelineWidth: BehaviorSubject<number>;
  private _zoomLevel: BehaviorSubject<number>;

  private _minZoomLevel: number;
  private _maxZoomLevel: number;

  // Observable Outputs
  timelineDurationStream: Observable<number>; // broadcast
  timelineViewportWidthStream: Observable<number>; // broadcast
  timelineWidthStream: Observable<number>;
  zoomLevelStream: Observable<number>; // can also change on viewport resize

  constructor() {
    this._timelineDuration = new BehaviorSubject(null);
    this._timelineViewportWidth = new BehaviorSubject(null);
    this._timelineWidth = new BehaviorSubject(null);
    this._zoomLevel = new BehaviorSubject(null);

    this._minZoomLevel = null;
    this._maxZoomLevel = 100;

    this.timelineDurationStream = this._timelineDuration.asObservable();
    this.timelineViewportWidthStream = this._timelineViewportWidth.asObservable();
    this.timelineWidthStream = this._timelineWidth.asObservable();
    this.zoomLevelStream = this._zoomLevel.asObservable();
  }

  // // utility to resend the current value of a BehaviorSubject
  // private resend<T>(sub: BehaviorSubject<T>) {
  //   if (sub.value != null) { sub.next(sub.value); }
  // }
  //
  // //
  // flushStreams() {
  //   this.resend(this._timelineDuration);
  //   this.resend(this._timelineViewportWidth);
  //   this.resend(this._timelineWidth);
  //   this.resend(this._zoomLevel);
  // }

  // Set timeline duration [s] (> 0)
  // => Broadcasts:
  //    New timeline duration (timelineDuration)
  //    New timeline width [px] (timelineWidth)
  set timelineDuration(duration: number) {
    if (duration <= 0) throw new Error('Invalid timeline duration. (Needs to be > 0)');
    this._timelineDuration.next(duration);
    if (!this._zoomLevel.value) return;
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
    if (zoom <= 0) throw new Error('Invalid zoom level. (Needs to be > 0)');
    if (this._minZoomLevel && zoom < this._minZoomLevel) { zoom = this._minZoomLevel; }
    else if (this._maxZoomLevel && zoom > this._maxZoomLevel) { zoom = this._maxZoomLevel; }
    this._zoomLevel.next(zoom);
    if (!this._timelineDuration.value) return;
    this._timelineWidth.next(zoom * this._timelineDuration.value);
  }

  get zoomLevel() {
    return this._zoomLevel.value;
  }

  // Set width of visible part of timeline (viewport) [px] (> 0)
  // => Broadcasts:
  //    New viewport width (timelineViewportWidth)
  //    New zoom level [px/s] (zoomLevel)
  // => Calculates: new minimum zoom level
  setTimelineViewportWidth(width: number) {
    if (width <= 0) throw new Error('Invalid viewport width. (Needs to be > 0)');
    this._timelineViewportWidth.next(width);

    // Adjust min zoom level to new width
    if (!this._minZoomLevel || !this._timelineDuration) return;
    let minZoomOld = this._minZoomLevel;
    this._minZoomLevel = width / this._timelineDuration.value;
    let minZoomNew = this._minZoomLevel;

    // Interpolate new zoom level
    if (!this._zoomLevel.value) return;
    let zoomOld = this._zoomLevel.value;
    let maxZoom = this._maxZoomLevel;
    let scale = (zoomOld-minZoomOld) / (maxZoom - minZoomOld);
    let zoomNew = scale * (maxZoom - minZoomNew);
    this.zoomLevel = zoomNew;
  }

  get timelineViewportWidth() {
    return this._timelineViewportWidth.value;
  }


  // Conversion Functions (one time)
  convertPixelsToSeconds(px: number): number {
    return px / this._zoomLevel.value;
  }

  convertSecondsToPixels(s:number): number {
    return s * this._zoomLevel.value;
  }

  // Streaming Conversion Functions
  convertPixelsToSecondsStream(px: number): Observable<number> {
    return this.zoomLevelStream.map( zoomLevel => px / zoomLevel );
  }

  convertSecondsToPixelsStream(s: number): Observable<number> {
    return this.zoomLevelStream.map( zoomLevel => s * zoomLevel );
  }

}
