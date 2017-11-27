import {Injectable} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as JSZip from 'jszip'
import {saveAs} from 'file-saver'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/pairwise'

import * as project from '../actions/project'
import * as fromProject from '../reducers'

import {
  _DEFAULT_PROJECT_PATH_, _METADATA_PATH_,
  _VIDEODATA_PATH_, _EXPORT_PROJECT_NAME_,
  _PROJECT_AUTOSAVE_DEBOUNCE_
} from '../../config/project'
// import {_SNAPSHOTS_DEBOUNCE_} from '../../config/snapshots'
import {_DEFZIPOTPIONS_} from '../../config/zip'
import {LFCache} from '../cache/LFCache'
import {loadProject, extractProject} from '../project'
import {ensureValidProjectData} from '../project/validate'
import {loadZip} from '../zip'
import {ProjectSnapshotRecordFactory} from '../model'

@Injectable()
export class ServerProxy {
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _actions: Actions,
    private readonly _cache: LFCache,
    private readonly _store: Store<fromProject.State>) {
      const projectState = this._store.select(fromProject.getProjectState)
        .filter(proj => proj.get('meta', null) !== null && proj.get('video', null) !== null)
        .share()

      const mutableProjectState = projectState.map(proj => {
        return {
          meta: proj.get('meta', null)!.toJS(),
          video: proj.get('video', null)
        }
      })

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
                const projectData = {meta, video}

                // mutates project data
                ensureValidProjectData(projectData)

                this._store.dispatch(new project.ProjectLoadSuccess({meta, video}))
              } else {
                const projectData = await loadProject(_DEFAULT_PROJECT_PATH_)

                // mutates project data
                ensureValidProjectData(projectData)

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
        this.importProject.subscribe({
          next: async ({payload}) => {
            try {
              const zip = await loadZip(payload)
              const projectData = await extractProject(zip)

              // mutates project data
              ensureValidProjectData(projectData)

              await this._cache.clearAll()

              const cachePromises = [
                this._cache.cache('meta', projectData.meta),
                this._cache.cache('video', projectData.video)
              ]

              await Promise.all(cachePromises)

              this._store.dispatch(new project.ProjectLoadSuccess(projectData))
            } catch(err) {
              this._store.dispatch(new project.ProjectImportError(err))
            }
          },
          error: err => {
            this._store.dispatch(new project.ProjectImportError(err))
          }
        }))

      this._subs.push(
        this.importVideo.subscribe({
          next: async ({payload}) => {
            try {
              await this._cache.clear('video')
              await this._cache.cache('video', payload)

              this._store.dispatch(new project.ProjectImportVideoSuccess(payload))
            } catch(err) {
              this._store.dispatch(new project.ProjectImportVideoError(err))
            }
          },
          error: err => {
            this._store.dispatch(new project.ProjectImportVideoError(err))
          }
        }))

      this._subs.push(
        this.exportProject
          .withLatestFrom(mutableProjectState, (_, proj) => proj)
          .subscribe({
            next: async ({meta, video}) => {
              try {
                const zip = new JSZip()
                zip.file(`${_METADATA_PATH_}`, JSON.stringify(meta))
                zip.file(`${_VIDEODATA_PATH_}`, video!)

                const zipBlob = await zip.generateAsync(_DEFZIPOTPIONS_) as Blob
                saveAs(zipBlob, _EXPORT_PROJECT_NAME_)
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

      const projectUpdate =
        this._actions.filter(action => {
          return action.type === project.PROJECT_UPDATE_ANNOTATION ||
            action.type === project.PROJECT_ADD_ANNOTATION ||
            action.type === project.PROJECT_DELETE_ANNOTATION ||
            action.type === project.PROJECT_UPDATE_TRACK ||
            action.type === project.PROJECT_ADD_TRACK ||
            action.type === project.PROJECT_DELETE_TRACK ||
            action.type === project.PROJECT_SET_TIMELINE_DURATION ||
            action.type === project.PROJECT_UNDO ||
            action.type === project.PROJECT_REDO
        })

      this._subs.push(
        projectUpdate
          .debounceTime(_PROJECT_AUTOSAVE_DEBOUNCE_)
          .withLatestFrom(mutableProjectState)
          .subscribe(([, projectData]) => {
            // autosave
            ensureValidProjectData(projectData)
            this._cache.cache('meta', projectData.meta)
          }))

      this._subs.push(
        projectUpdate
          .filter(action => {
            return action.type !== project.PROJECT_SET_TIMELINE_DURATION &&
              action.type !== project.PROJECT_UNDO &&
              action.type !== project.PROJECT_REDO
          })
          // .debounceTime(_SNAPSHOTS_DEBOUNCE_)
          .withLatestFrom(projectState.pairwise())
          .subscribe(([_, [prevState, __]]) => {
            const projState = prevState.get('meta', null)!
            const snapshot = new ProjectSnapshotRecordFactory({
              timestamp: Date.now(),
              state: projState
            })
            this._store.dispatch(new project.ProjectClearRedo())
            this._store.dispatch(new project.ProjectPushUndo(snapshot))
          }))
    }

  @Effect({dispatch: false})
  readonly loadProject = this._actions.ofType<project.ProjectLoad>(project.PROJECT_LOAD)

  @Effect({dispatch:false})
  readonly importProject = this._actions.ofType<project.ProjectImport>(project.PROJECT_IMPORT)

  @Effect({dispatch: false})
  readonly importVideo = this._actions.ofType<project.ProjectImportVideo>(project.PROJECT_IMPORT_VIDEO)

  @Effect({dispatch: false})
  readonly exportProject = this._actions.ofType<project.ProjectExport>(project.PROJECT_EXPORT)

  @Effect({dispatch: false})
  readonly resetProject = this._actions.ofType<project.ProjectReset>(project.PROJECT_RESET)

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}


