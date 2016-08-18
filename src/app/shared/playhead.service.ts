import { Injectable } from '@angular/core';
import { TimelineService } from './timeline.service';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class PlayheadService {

  private _time: BehaviorSubject<number>;

  timeStream: Observable<number>;
  positionStream: Observable<number>;
  relativeStream: Observable<number>;

  constructor(private ts: TimelineService) {
    this._time = new BehaviorSubject(0);
    this.timeStream = this._time.asObservable();
    this.positionStream = this.timeStream.map( time => ts.convertSecondsToPixels(time) );
    this.relativeStream = this.timeStream.map( time => time / ts.timelineDuration );
  }

  set time(s: number) {
    if (s < 0) { s = 0; }
    else if (s > this.ts.timelineDuration) { s = this.ts.timelineDuration; }
    this._time.next(s);
  }

  get time() {
    return this._time.value;
  }

  set position(px: number) {
    this.time = this.ts.convertPixelsToSeconds(px);
  }

  get position() {
    return this.ts.convertSecondsToPixels( this._time.value );
  }

  set relative(percent: number) {
    this.time = percent * this.ts.timelineDuration;
  }

  get relative() {
    return this._time.value / this.ts.timelineDuration;
  }

}
