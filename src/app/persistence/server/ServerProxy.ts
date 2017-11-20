import {Injectable} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

// import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/zip'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

import * as io from '../../io/actions/io'
import * as project from '../actions/project'
import * as fromProject from '../reducers'

// import {_DEFAULT_PROJECT_PATH_} from '../../config'
import LFCache from '../cache/LFCache'
// import {loadProject} from '../project'

@Injectable()
export default class ServerProxy {
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _actions: Actions,
    private readonly _cache: LFCache,
    private readonly _store: Store<fromProject.State>) {
      this._subs.push(
        this.fetch.subscribe(async ({payload: {id:projectId}}) => {
          try {
            const isCached = await this._cache.isCached(projectId)
            if(isCached) {

            } else {
              this._store.dispatch(new io.IOImportProject())
            }
          } catch(err) {
            this._store.dispatch(new project.ProjectFetchError(err))
          }
        }))

      // TODO:
      // Sub to IO import success (comes either from default import or manual import)
    }

  @Effect()
  readonly fetch = this._actions
    .ofType<project.ProjectFetch>(project.PROJECT_FETCH)
    // .concatMap(action => {
    //   return Observable.zip(
    //     Observable.of(action),
    //     this._cache.isCached(Observable.of(action.payload.id)))
    // })
    // .concatMap(([{payload: {id}}, isCached]) => {
    //   return isCached ?
    //     this._cache.getCached(id).map(res => new project.ProjectFetchSuccess(res)) :
    //     loadProject(Observable.of(_DEFAULT_PROJECT_PATH_)).map(res => new project.ProjectFetchSuccess(res))
    // })
    // .catch(err => Observable.of(new project.ProjectFetchError(err)))

  // @Effect()
  // update = Observable.merge(
  //   this._actions.ofType<project.ProjectFetchSuccess>(project.PROJECT_FETCH_SUCCESS)
  //     .map(action => {

  //     })
  //     .catch(err => )
}


