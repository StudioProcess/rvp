import {Injectable} from '@angular/core'

import {Effect, Actions} from '@ngrx/effects'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/zip'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

import * as project from '../../core/actions/project'

import {IServer} from '../server/IServer'
import LFCache from '../cache/LFCache'

import {loadProject} from '../project'
import {_DEFAULT_PROJECT_PATH_} from '../../config'

@Injectable()
export default class ServerProxy implements IServer {
  constructor(
    private readonly actions: Actions,
    private readonly _cache: LFCache) {}

  @Effect()
  fetch = this.actions
    .ofType<project.ProjectFetch>(project.PROJECT_FETCH)
    .concatMap(action => {
      return Observable.zip(
        Observable.of(action),
        this._cache.isCached(Observable.of(action.payload.id)))
    })
    .concatMap(([{payload: {id}}, isCached]) => {
      return isCached ?
        this._cache.getCached(id).map(res => new project.ProjectFetched(res)) :
        loadProject(Observable.of(_DEFAULT_PROJECT_PATH_)).map(res => new project.ProjectFetched(res))
    })
    .catch(err => Observable.of(new project.ProjectFetchError(err)))
}


