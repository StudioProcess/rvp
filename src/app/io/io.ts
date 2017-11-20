import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'

import * as fromProject from '../persistence/reducers'
import * as io from './actions/io'

@Injectable()
export class IOEffects implements OnDestroy {
  private readonly _subs: Subscription[] = []
  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromProject.State>) {
      this._subs.push(
        this.exportProject.subscribe(([, project]) => {
          console.log(project)
          // const exportData =
          // 1. immut to js {id, timeline}
          // 2. create zip
          // 3. saveAs
          // 4. dispatch IOExportSuccess
        }))
    }

  @Effect({dispatch: false})
  readonly exportProject = this._actions
    .ofType<io.IOExportProject>(io.IO_EXPORT_PROJECT)
    .withLatestFrom(this._store.select(fromProject.getProjectState))

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
