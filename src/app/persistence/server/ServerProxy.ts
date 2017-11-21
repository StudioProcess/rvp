import {Injectable} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as JSZip from 'jszip'
import {saveAs} from 'file-saver'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/share'

import * as project from '../actions/project'
import * as fromProject from '../reducers'

import {_DEFAULT_PROJECT_PATH_} from '../../config'
import {_DEFZIPOTPIONS_} from '../../config/zip'
import LFCache from '../cache/LFCache'
import {loadProject} from '../project'

@Injectable()
export default class ServerProxy {
  private readonly _subs: Subscription[] = []

  // TODO: openProject: unzip, cache video, cache project, project load success
  // TODO: openVideo: cache video, project load success
  // TODO: autoSave: cache project

  constructor(
    private readonly _actions: Actions,
    private readonly _cache: LFCache,
    private readonly _store: Store<fromProject.State>) {
      const projectState = this._store.select(fromProject.getProjectState)
        .filter(proj => proj.get('meta', null) !== null && proj.get('video', null) !== null)
        .map(proj => {
          return {
            meta: proj.get('meta', null)!.toJS(),
            video: proj.get('video', null)
          }
        })
        .share()

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
                  this._cache.cache('meta', projectData.meta),
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
        this.exportProject
          .withLatestFrom(projectState, (_, proj) => proj)
          .subscribe({
            next: async ({meta, video}) => {
              try {
                const zip = new JSZip()
                zip.file('project/meta.json', JSON.stringify(meta))
                zip.file('project/video.m4v', video!)

                const zipBlob = await zip.generateAsync(_DEFZIPOTPIONS_) as Blob
                saveAs(zipBlob, 'project.zip')
              } catch(err) {
                this._store.dispatch(new project.ProjectExportError(err))
              }
            },
            error: err => {
              this._store.dispatch(new project.ProjectExportError(err))
            }
          }))

      this._subs.push(
        this.resetProject.subscribe({
          next: async () => {
            await this._cache.clearAll()
            this._store.dispatch(new project.ProjectLoad())
          },
          error: err => {
            this._store.dispatch(new project.ProjectResetError(err))
          }
        }))
    }

  @Effect({dispatch: false})
  readonly loadProject = this._actions.ofType<project.ProjectLoad>(project.PROJECT_LOAD)

  @Effect({dispatch: false})
  readonly exportProject = this._actions.ofType<project.ProjectExport>(project.PROJECT_EXPORT)

  @Effect({dispatch: false})
  readonly resetProject = this._actions.ofType<project.ProjectReset>(project.PROJECT_RESET)

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}


