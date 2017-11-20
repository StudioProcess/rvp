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

// import * as io from '../../io/actions/io'
import * as project from '../actions/project'
import * as fromProject from '../reducers'

import {_DEFAULT_PROJECT_PATH_} from '../../config'
import LFCache from '../cache/LFCache'
import {loadProject} from '../project'

@Injectable()
export default class ServerProxy {
  private readonly _subs: Subscription[] = []

  // TODO: loadProject: cached: write to store; !cached: load default project, unzip, cache video, cache project, write to store
  // TODO: exportProject: zip all, saveAs
  // TODO: resetProject: reset cache, load default project, unzip, cache video, cache project, write to store
  // TODO: openProject: unzip, cache video, cache project, write to store
  // TODO: openVideo: cache video, write to store
  // TODO: autoSave: cache project

  constructor(
    private readonly _actions: Actions,
    private readonly _cache: LFCache,
    private readonly _store: Store<fromProject.State>) {
      this._subs.push(
        this.loadProject.subscribe(async () => {
          try {
            const isCached = await this._cache.isCached('project')
            if(isCached) {
              // TODO
            } else {
              const project = await loadProject(_DEFAULT_PROJECT_PATH_)
              this._store.dispatch(new project.ProjectLoadSuccess(project))
            }
          } catch(err) {
            this._store.dispatch(new project.ProjectLoadError(err))
          }
        }))
      }

  @Effect()
  readonly loadProject = this._actions
    .ofType<project.ProjectLoad>(project.PROJECT_LOAD)
    // .concatMap(action => {
    //   return Observable.zip(
    //     Observable.of(action),
    //     this._cache.isCached(Observable.of(action.payload.id)))
    // })
    // .concatMap(([{payload: {id}}, isCached]) => {
    //   return isCached ?
    //     this._cache.getCached(id).map(res => new project.ProjectLoadSuccess(res)) :
    //     loadProject(Observable.of(_DEFAULT_PROJECT_PATH_)).map(res => new project.ProjectLoadSuccess(res))
    // })
    // .catch(err => Observable.of(new project.ProjectLoadError(err)))

  // @Effect()
  // update = Observable.merge(
  //   this._actions.ofType<project.ProjectLoadSuccess>(project.PROJECT_LOAD_SUCCESS)
  //     .map(action => {

  //     })
  //     .catch(err => )
}


