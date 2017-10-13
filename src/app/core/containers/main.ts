import {Component, ChangeDetectionStrategy, OnInit, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/filter'

import * as fromRoot from '../reducers'
import * as fromProject from '../../persistence/reducers'
import * as project from '../../persistence/actions/project'

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <!--<rv-loading *ngIf="_isLoading" [isLoading]="true"></rv-loading>-->
      <div *ngIf="!_isLoading">
        <div class="row video-and-inspector">
          <div class="column video-component">
            <rv-player [rvVideoObjectURL]="videoObjectURL"></rv-player>
          </div>
        </div>
      </div>
    </div>`
})
export class MainContainer implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = []

  private _isLoading = false

  videoObjectURL: Observable<string> =
    this._projectStore.select(fromProject.getVideoObjectURL)
      .filter(objUrl => objUrl !== null) as Observable<string>

  constructor(
    private readonly _rootStore: Store<fromRoot.State>,
    private readonly _projectStore: Store<fromProject.State>) {
      debugger
    }

  ngOnInit() {
    this._subs.push(this._rootStore.select(fromRoot.getIsLoading).subscribe(isLoading => {
      this._isLoading = isLoading
    }))

    /*
     * Let's say id='p0' identifies the default project.
     * In future, if a server implementation is available,
     * the 'current' project id could be provided by the server.
     */
    this._rootStore.dispatch(new project.ProjectFetch({id: 'p0'}))
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
