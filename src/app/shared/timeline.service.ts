import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

// Initialization object needed to create a TimelineService instance
// (Essentially constructor params)
interface TimelineInputValues {
  timelineDuration: number;
  viewportWidth: number;
  zoom: number;
  scroll: number;
}

@Injectable()
export class TimelineService {

  private _inputs: BehaviorSubject<TimelineInputValues>;
  private _timelineWidth: number;

  // Observable Outputs
  timelineDurationStream: Observable<number>;
  viewportWidthStream: Observable<number>;
  zoomStream: Observable<number>;
  scrollStream: Observable<number>;
  timelineWidthStream: Observable<number>;

  constructor() {}

  init(initial: TimelineInputValues) {
    this._inputs = new BehaviorSubject<TimelineInputValues>(initial);
    this.timelineDurationStream = this._inputs.pluck('timelineDuration').distinctUntilChanged() as Observable<number>;
    this.viewportWidthStream = this._inputs.pluck('viewportWidth').distinctUntilChanged() as Observable<number>;
    this.zoomStream = this._inputs.pluck('zoom').distinctUntilChanged() as Observable<number>;
    this.scrollStream = this._inputs.pluck('scroll').distinctUntilChanged() as Observable<number>;
    this.timelineWidthStream = Observable.combineLatest(this.viewportWidthStream, this.zoomStream).map( ([viewportWidth, zoom]) => {
      return this._timelineWidth = viewportWidth/zoom;
    });
    log.debug('time service initialized', initial, this);
  };

  private changeInputValue(key, value) {
    let obj = {};
    obj[key] = value;
    let newValues = Object.assign( {}, this._inputs.value, obj );
    this._inputs.next(newValues);
  }

  // Set timeline duration [s] (> 0)
  set timelineDuration(duration: number) {
    if (duration <= 0) throw new Error('Invalid timeline duration. (Needs to be > 0)');
    this.changeInputValue('timelineDuration', duration);
  }

  // get timelineDuration() {
  //   return this._timelineDuration.value;
  // }

  // Set width of visible part of timeline (viewport) [px] (> 0)
  set viewportWidth(width: number) {
    // log.debug('setting viewport width', width);
    if (width <= 0) throw new Error('Invalid viewport width. (Needs to be > 0)');
    this.changeInputValue('viewportWidth', width);
  }

  // get viewportWidth() {
  //   return this._timelineViewportWidth.value;
  // }

  // Set zoom level [0..1]
  set zoom(zoom: number) {
    // log.debug('setting zoom level', zoom);
    if (zoom < 0.001) { zoom = 0.001; }
    else if (zoom > 1) { zoom = 1; }
    this.changeInputValue('zoom', zoom);
  }

  // get zoom() {
  //   return this._zoomLevel.value;
  // }

  // Set scroll position [0..1]
  set scroll(scroll: number) {
    log.debug('setting scroll position', scroll);
    if (scroll < 0) { scroll = 0; }
    else if (scroll > 1) { scroll = 1; }
    this.changeInputValue('scroll', scroll);
  }

  // get scroll() {
  //   return this._scrollPosition.value;
  // }



  // Conversion Functions (one time)
  convertPixelsToSeconds(pixels: number): number {
    return pixels / this._timelineWidth * this._inputs.value.timelineDuration;
  }

  convertPercentToSeconds(percent: number): number {
    return percent * this._inputs.value.timelineDuration;
  }
  //
  // convertViewportPixelsToSeconds(px:number): number {
  //   return  this.convertPixelsToSeconds(this._scrollPosition.value + px);
  // }
  //
  // convertSecondsToPixels(s:number): number {
  //   return s * this._zoomLevel.value;
  // }
  //
  // convertSecondsToPercent(s:number): number {
  //   return s * this._zoomLevel.value;
  // }

}
