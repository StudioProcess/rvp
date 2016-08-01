import { Injectable } from '@angular/core';
import { TimeService } from './time.service';
import { Observable, Subject } from 'rxjs/Rx';

interface PlayerAction {
  type: 'setTime'|'play'|'pause';
  [key:string]: any;
}

@Injectable()
export class PlayerService {

  private _action: Subject<PlayerAction>;
  actionStream: Observable<PlayerAction>;

  constructor(private timeService: TimeService) {
    this._action = new Subject<PlayerAction>();
    this.actionStream = this._action.asObservable();
  }

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

}
