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
    <div class="nav-wrapper">
      <div class="row">
        <div class="small-6 column">
          <rv-logo></rv-logo>
        </div>
        <div class="small-6 column text-right">
          <rv-projectbtn data-open="settings-reveal"></rv-projectbtn>
          <rv-projectmodal class="reveal" id="settings-reveal" data-reveal></rv-projectmodal>
        </div>
      </div>
    </div>
    <div>
      <!--<rv-loading *ngIf="_isLoading" [isLoading]="true"></rv-loading>-->
      <div *ngIf="!_isLoading">
        <div class="row">
          <div class="small-12 medium-6 large-8 column">
            <rv-player></rv-player>
          </div>
          <div class="small-12 medium-6 large-4 column">
            <rv-inspector></rv-inspector>
          </div>
          <div class="small-12 column">
            <rv-timeline></rv-timeline>
          </div>
          <div class="small-12 column">
            <rv-footer></rv-footer>
          </div>
        </div>
      </div>
    </div>`,
  styles: [`
    :host {
      display: block;
      padding: 5px;
    }

    .nav-wrapper {
      margin-top: 1.4em;
      margin-bottom: 0.5em;
    }
  `]
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
