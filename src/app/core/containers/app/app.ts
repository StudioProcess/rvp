import {Component, ChangeDetectionStrategy, OnInit} from '@angular/core'

import {Store} from '@ngrx/store'

import * as fromRoot from '../../../reducers'
import * as project from '../../actions/project'

@Component({
  selector: 'rv-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <rv-loading [isLoading]="isLoading | async"></rv-loading>
      <!-- Other content -->
      :) Other content
    </div>`
})
export class AppComponent implements OnInit {
  isLoading = this._store.select(fromRoot.getIsLoading)
  video = this._store.select(fromRoot.getVideo)

  constructor(private readonly _store: Store<fromRoot.State>) {}

  ngOnInit() {
    /*
     * Let's say id='p0' identifies the default project.
     * In future, if a server implementation is available,
     * the default project id could be provided by the server.
     */
    this._store.dispatch(new project.ProjectFetch({id: 'p0'}))
  }
}
