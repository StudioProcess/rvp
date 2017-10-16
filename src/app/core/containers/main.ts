import {Component, ChangeDetectionStrategy, OnInit, OnDestroy, AfterViewInit} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'

import * as fromRoot from '../reducers'
import * as project from '../../persistence/actions/project'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <rv-menu></rv-menu>
    </div>
    <div class="test">
      <!--<rv-loading *ngIf="_isLoading" [isLoading]="true"></rv-loading>-->
      <div *ngIf="!_isLoading">
        <div>
          <div>
            <rv-player></rv-player>
          </div>
          <div>
            <rv-inspector></rv-inspector>
          </div>
        </div>
      </div>
    </div>`
})
export class MainContainer implements OnInit, OnDestroy, AfterViewInit {
  private readonly _subs: Subscription[] = []

  private _isLoading = false

  constructor(
    private readonly _rootStore: Store<fromRoot.State>) {}

  ngOnInit() {
    this._subs.push(this._rootStore.select(fromRoot.getIsLoading)
      .subscribe(isLoading => {
        this._isLoading = isLoading
      }))

    /*
     * Let's say id='p0' identifies the default project.
     * In future, if a server implementation is available,
     * the 'current' project id could be provided by the server.
     */
    this._rootStore.dispatch(new project.ProjectFetch({id: 'p0'}))
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
