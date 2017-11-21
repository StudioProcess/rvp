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

  // DONE: loadProject: cached: write to store; !cached: load default project, unzip, cache video, cache project, write to store
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
        this.loadProject.subscribe({
          next: async () => {
            try {
              const isCached = await this._cache.isCached(['meta', 'video'])
              if(isCached) {
                const getPromises = [
                  this._cache.getCached('meta'),
                  this._cache.getCached('video')
                ]

                const [meta, video] = await Promise.all(getPromises)

                this._store.dispatch(new project.ProjectLoadSuccess({meta, video}))
              } else {
                const projectData = await loadProject(_DEFAULT_PROJECT_PATH_)

                const cachePromises = [
                  this._cache.cache('meta', projectData.project),
                  this._cache.cache('video', projectData.video)
                ]

                await Promise.all(cachePromises)

                this._store.dispatch(new project.ProjectLoadSuccess(projectData))
              }
            } catch(err) {
              this._store.dispatch(new project.ProjectLoadError(err))
            }
          },
          error: err => {
            this._store.dispatch(new project.ProjectLoadError(err))
          }
        }))

      this._subs.push(
        this.exportProject.subscribe({
          next: () => {

          },
          error: err => {
            console.log(err)
          }
        })
      )
    }

  @Effect({dispatch: false})
  readonly loadProject = this._actions.ofType<project.ProjectLoad>(project.PROJECT_LOAD)

  @Effect({dispatch: false})
  readonly exportProject = this._actions.ofType<project.ProjectExport>(project.PROJECT_EXPORT)

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}


