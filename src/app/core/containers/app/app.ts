import {Component, ChangeDetectionStrategy, OnInit} from '@angular/core'

import {Store} from '@ngrx/store'

import * as fromRoot from '../../../reducers'
import * as project from '../../actions/project'

@Component({
  selector: 'rv-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app.html'
})
export class AppComponent implements OnInit {
  isLoading = this.store.select(fromRoot.getIsLoading)
  project = this.store.select(fromRoot.getProject)

  constructor(readonly store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.store.dispatch(new project.LoadProject())
  }
}
