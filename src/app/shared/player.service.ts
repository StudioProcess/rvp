import { Injectable } from '@angular/core';
import { TimeService } from './time.service';
import { Observable, Subject } from 'rxjs/Rx';

interface PlayerAction {
  type: 'setTime'|'play'|'pause'|'toggle';
  [key:string]: any;
}

interface PlayerEvent {
  type: 'videoLoaded';
  [key:string]: any;
}

interface VideoMetadata {
  src: string;
  type: string;
  duration: number;
  width: number;
  height: number;
  file: {
    [key:string]: any;
  }
}

@Injectable()
export class PlayerService {

  private _action: Subject<PlayerAction>;
  private _event: Subject<PlayerEvent>;
  actionStream: Observable<PlayerAction>; // Actions (App    -> Player)
  eventStream: Observable<PlayerEvent>;   // Events  (Player ->    App)

  constructor(private timeService: TimeService) {
    this._action = new Subject<PlayerAction>();
    this._event = new Subject<PlayerEvent>();
    this.actionStream = this._action.asObservable();
    this.eventStream = this._event.asObservable();
  }

  // Actions (App -> Player)
  setTime(s: number) {
    this._action.next( {type:'setTime', time:s} );
  }

  play() {
    this._action.next( {type:'play'} );
  }

  pause() {
    this._action.next( {type:'pause'} );
  }

  stop() {
    this._action.next( {type:'pause'} );
    this._action.next( {type:'setTime', time:0} );
  }

  toggle() {
    this._action.next( {type:'toggle'} );
  }

  // Events (Player -> App)
  videoLoaded(meta: VideoMetadata) {
    this._event.next( {type:'videoLoaded', meta} );
  }

}
