import {Component, ChangeDetectionStrategy, OnInit, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'

import * as fromRoot from '../../reducers'
import * as project from '../actions/project'

@Component({
  selector: 'rv-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <rv-loading *ngIf="_isLoading" [isLoading]="true"></rv-loading>
      <div *ngIf="!_isLoading">
        <div class="row video-and-inspector">
          <div class="column video-component">
            <rv-player></rv-player>
          </div>
        </div>
      </div>
    </div>`
})
export class AppContainer implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = [];
  private _isLoading = false

  constructor(private readonly _store: Store<fromRoot.State>) {}

  ngOnInit() {
    this._subs.push(this._store.select(fromRoot.getIsLoading).subscribe(isLoading => {
      this._isLoading = isLoading
    }))

    /*
     * Let's say id='p0' identifies the default project.
     * In future, if a server implementation is available,
     * the 'current' project id could be provided by the server.
     */
    this._store.dispatch(new project.ProjectFetch({id: 'p0'}))
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
