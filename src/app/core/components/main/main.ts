import {Component, ChangeDetectionStrategy, OnInit, OnDestroy, AfterViewInit} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'main.html',
  styleUrls: ['main.scss']
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
     * Let's say id=0 identifies the default project.
     * In future, if a server implementation is available,
     * the 'current' project id could be provided by the server.
     */
    this._rootStore.dispatch(new project.ProjectFetch({id: 0}))
  }

  openProject() {
    console.log('TODO: open project')
  }

  exportProject() {
    console.log('TODO: export project')
  }

  resetProject() {
    console.log('TODO: reset project')
  }

  changeVideo() {
    console.log('TODO: change video')
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
