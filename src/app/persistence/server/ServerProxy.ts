import { Injectable, OnDestroy } from '@angular/core'

import { Store } from '@ngrx/store'
import { Effect, Actions, ofType } from '@ngrx/effects'

import * as JSZip from 'jszip'
import { saveAs } from 'file-saver'

import { Subscription } from 'rxjs'
import {
  withLatestFrom, map, share,
  pairwise, filter, debounceTime
} from 'rxjs/operators'

import * as project from '../actions/project'
import * as fromProject from '../reducers'
import { VIDEO_TYPE_BLOB } from '../../persistence/model'

import {
  _PROJECT_DEFAULT_PATH_, _PROJECT_METADATA_PATH_,
  _PROJECT_VIDEODATA_PATH_, _PROJECT_AUTOSAVE_DEBOUNCE_,
  _PROJECT_DEFAULT_TITLE_
} from '../../config/project'
import { _ZIP_DEFAULT_OTPIONS_ } from '../../config/zip'
import { LFCache } from '../cache/LFCache'
import { loadProject, extractProject } from '../project'
import { ensureValidProjectData } from '../project/validate'
import { loadZip } from '../zip'
import { ProjectSnapshotRecordFactory } from '../model'
import { formatDuration } from '../../lib/time'

declare var $: any

// import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import { MessageService } from '../../core/actions/message.service'

@Injectable()
export class ServerProxy implements OnDestroy {
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _actions: Actions,
    private readonly _cache: LFCache,
    private readonly _store: Store<fromProject.State>,
    private readonly _msg: MessageService) {
    const projectState = this._store.select(fromProject.getProjectState)
      .pipe(
        filter(proj => proj.get('meta', null) !== null),
        share())

    const mutableProjectState = projectState
      .pipe(
        map(proj => {
          return {
            meta: proj.get('meta', null)!.toJS(),
            video: proj.get('videoBlob', null)
          }
        }))


    this._subs.push(
      this.loadProject.subscribe({
        next: async () => {
          try {
            const isCached = await this._cache.isCached(['meta', 'video'])
            if (isCached) {
              const getPromises = [
                this._cache.getCached('meta'),
                this._cache.getCached('video')
              ]

              const [meta, video] = await Promise.all(getPromises)
              const projectData = { meta, video }

              // mutates project data
              ensureValidProjectData(projectData)
              //console.log(/*projectData,*/ meta)

              this._store.dispatch(new project.ProjectLoadSuccess({ meta, video }))
            } else {
              const projectData = await loadProject(_PROJECT_DEFAULT_PATH_)

              // mutates project data
              ensureValidProjectData(projectData)
              //console.log (projectData);

              const cachePromises = [
                this._cache.cache('meta', projectData.meta),
                this._cache.cache('video', projectData.video)
              ]

              await Promise.all(cachePromises)

              this._store.dispatch(new project.ProjectLoadSuccess(projectData))
            }
          } catch (err) {
            this._store.dispatch(new project.ProjectLoadError(err))
          }
        },
        error: (err: any) => {
          this._store.dispatch(new project.ProjectLoadError(err))
        }
      }))

    this._subs.push(
      this.importProject.subscribe({
        //next: async (payload:any) => {
        next: async ({ payload }) => {

          const progressModal = $('#progress-modal') as any
          progressModal.foundation('open')

          try {
            const zip = await loadZip(payload)
            const projectData = await extractProject(zip, this._msg)

            // mutates project data
            ensureValidProjectData(projectData)

            await this._cache.clearAll()

            const cachePromises = [
              this._cache.cache('meta', projectData.meta),
              this._cache.cache('video', projectData.meta.video.type === VIDEO_TYPE_BLOB ? projectData.video : null)
            ]

            await Promise.all(cachePromises)

            this._store.dispatch(new project.ProjectLoadSuccess(projectData))

            this._msg!.update({ percent: 100, text: 'please wait' })
            progressModal.foundation('close')

          } catch (err) {

            this._msg!.update({ error: true, close: true, text: 'An error occurred' })
            this._store.dispatch(new project.ProjectImportError(err))
          }
        },
        error: (err: any) => {
          this._msg!.update({ error: true, close: true, text: 'An error occurred' })
          this._store.dispatch(new project.ProjectImportError(err))
        }
      }))

    this._subs.push(
      this.importVideo.subscribe({
        //next: async (payload: any) => {
        next: async ({ payload }) => {
          try {
            await this._cache.clear('video')
            await this._cache.cache('video', payload.type === VIDEO_TYPE_BLOB ? payload.data : null)

            this._store.dispatch(new project.ProjectImportVideoSuccess(payload))
            this._msg!.update({ videoImportSuccess: true })
          } catch (err) {
            this._store.dispatch(new project.ProjectImportVideoError(err))
            this._msg!.update({ videoImportSuccess: false, error: err })
          }
        },
        error: (err: any) => {
          this._store.dispatch(new project.ProjectImportVideoError(err))
          this._msg!.update({ videoImportSuccess: false, error: err })
        }
      }))

    this._subs.push(
      this.exportProject
        .pipe(withLatestFrom(mutableProjectState, (_, proj) => proj))
        .subscribe({
          next: async ({ meta, video }) => {
            try {
              const progressModal = $('#progress-modal') as any
              progressModal.foundation('open')

              const zip = new JSZip()
              zip.file(`${_PROJECT_METADATA_PATH_}`, JSON.stringify(meta))
              zip.file(`${_PROJECT_VIDEODATA_PATH_}`, video as Blob)

              const zipBlob = await zip.generateAsync(_ZIP_DEFAULT_OTPIONS_, (metadata) => {
                const percent = metadata.percent.toFixed(2)
                const text = 'exporting ' + metadata.currentFile + ' ' + ((parseFloat(percent) <= 50) ? '1/2' : '2/2') + ' please wait'
                this._msg!.update({ percent: percent, text: text })
              }) as Blob

              const export_name = ((meta.general! && meta.general!.title!) ? meta.general.title : _PROJECT_DEFAULT_TITLE_) + '.rv'
              await saveAs(zipBlob, export_name)

              setTimeout(() => {
                this._msg!.update({ percent: 0, text: 'please wait' })
                progressModal.foundation('close')
              }, 1000)

            } catch (err) {
              this._store.dispatch(new project.ProjectExportError(err))
            }
          },
          error: (err: any) => {
            this._store.dispatch(new project.ProjectExportError(err))
          }
        }))

    this._subs.push(
      this.exportProjectAsText
        .pipe(withLatestFrom(mutableProjectState, ({ payload }, proj) => ({ type: payload, proj })))
        .subscribe({
          next: async ({ type, proj }) => {
            try {
              const annotations = []
              for (const track of proj.meta.timeline.tracks) {
                for (const stack of track.annotationStacks) {
                  for (let annotation of stack) {
                    annotation = Object.assign({}, annotation, { track }) // add track information
                    annotations.push(annotation)
                  }
                }
              }
              annotations.sort((a, b) => {
                if (a.utc_timestamp === b.utc_timestamp) {
                  return a.duration - b.duration
                } else {
                  return a.utc_timestamp - b.utc_timestamp
                }
              })
              let text = ''
              switch (type) {
                case 'csv':
                  text = '"Start","End","Track","Text"\n'
                  text += annotations.reduce((acc, a, idx) => {
                    acc += `"${formatDuration(a.utc_timestamp)}",`
                    acc += `"${formatDuration(a.utc_timestamp + a.duration)}",`
                    acc += `"${a.track.fields.title.replace(/"/g, '""')}",`
                    acc += `"${a.fields.description.replace(/"/g, '""')}"\n`
                    return acc
                  }, '')
                  break
                case 'srt':
                  text = annotations.reduce((acc, a, idx) => {
                    acc += (idx + 1) + '\n'
                    acc += formatDuration(a.utc_timestamp).replace('.', ',') + ' --> '
                    acc += formatDuration(a.utc_timestamp + a.duration).replace('.', ',') + '\n'
                    const track = a.track.fields.title, atext = a.fields.description
                    if (track) {
                      acc += track
                      if (atext) { acc += ': ' + atext + '\n' } else { acc += '\n' }
                    } else {
                      acc += atext + '\n'
                    }
                    acc += '\n'
                    return acc
                  }, '').trim()
                  break
                default:
                  text = annotations.reduce((acc, a) => {
                    acc += formatDuration(a.utc_timestamp) + ' — ' + formatDuration(a.utc_timestamp + a.duration) + '\n'
                    const track = a.track.fields.title, atext = a.fields.description
                    if (track) {
                      acc += track
                      if (atext) { acc += ': ' + atext + '\n' } else { acc += '\n' }
                    } else {
                      acc += atext + '\n'
                    }
                    acc += '\n'
                    return acc
                  }, '')
                  break
              }
              const textBlob = new Blob([text], { type: 'text/plain' })
              saveAs(textBlob, 'annotations.' + type)
            } catch (err) {
              this._store.dispatch(new project.ProjectExportError(err))
            }
          },
          error: (err: any) => {
            this._store.dispatch(new project.ProjectExportError(err))
          }
        }))

    this._subs.push(
      this.resetProject.subscribe({
        next: async () => {
          await this._cache.clearAll()
          this._store.dispatch(new project.ProjectLoad())
        },
        error: (err: any) => {
          this._store.dispatch(new project.ProjectResetError(err))
        }
      }))

    const projectUpdate =
      this._actions.pipe(filter(action => {
        //console.log(action)
        return action.type === project.PROJECT_UPDATE_ANNOTATION ||
          action.type === project.PROJECT_ADD_ANNOTATION ||
          action.type === project.PROJECT_DELETE_SELECTED_ANNOTATIONS ||
          action.type === project.PROJECT_PASTE_CLIPBOARD ||
          action.type === project.PROJECT_UPDATE_TRACK ||
          action.type === project.PROJECT_ADD_TRACK ||
          action.type === project.PROJECT_DELETE_TRACK ||
          action.type === project.PROJECT_DUPLICATE_TRACK ||
          action.type === project.PROJECT_INSERTAT_TRACK ||
          action.type === project.PROJECT_SET_TIMELINE_DURATION ||
          action.type === project.PROJECT_UNDO ||
          action.type === project.PROJECT_REDO ||
          action.type === project.PROJECT_IMPORT_VIDEO_SUCCESS ||
          action.type === project.PROJECT_LOAD_SUCCESS ||
          action.type === project.PROJECT_ANNOTATION_ADD_POINTER ||
          action.type === project.PROJECT_UPDATE_HASHTAGS ||
          action.type === project.PROJECT_UPDATE_TITLE ||
          action.type === project.PROJECT_UPDATE_VIEWMODE ||
          action.type === project.PROJECT_UPDATE_DEFALUT_ANNOTATION_DURATION
      }))

    this._subs.push(
      projectUpdate
        .pipe(
          debounceTime(_PROJECT_AUTOSAVE_DEBOUNCE_),
          withLatestFrom(mutableProjectState)
        ).subscribe(([, projectData]) => {
          // autosave
          ensureValidProjectData(projectData)
          if (projectData.meta.video.type === 'url') {
            if (typeof projectData.meta.video.url.href !== 'undefined') {
              projectData.meta.video.url = projectData.meta.video.url.href as URL
            }
          }
          this._cache.cache('meta', projectData.meta)
        }))

    this._subs.push(
      projectUpdate
        .pipe(
          filter(action => {
            /**
             *  Project state redo/undo exception filter
             */
            return action.type !== project.PROJECT_SET_TIMELINE_DURATION &&
              action.type !== project.PROJECT_UNDO &&
              action.type !== project.PROJECT_REDO &&
              action.type !== project.PROJECT_LOAD_SUCCESS &&
              action.type !== project.PROJECT_UPDATE_HASHTAGS
          }),
          withLatestFrom(projectState.pipe(pairwise()))
        ).subscribe(([_, [prevState, __]]) => {
          // push snapshot
          const projState = prevState.get('meta', null)!
          const snapshot = new ProjectSnapshotRecordFactory({
            timestamp: Date.now(),
            state: projState
          })
          //console.log (projState, snapshot);
          this._store.dispatch(new project.ProjectPushUndo(snapshot))
        }))
  }

  @Effect({ dispatch: false })
  //readonly loadProject = this._actions.ofType<project.ProjectLoad>(project.PROJECT_LOAD)
  readonly loadProject = this._actions.pipe(ofType<project.ProjectLoad>(project.PROJECT_LOAD))

  @Effect({ dispatch: false })
  //readonly importProject = this._actions.ofType<project.ProjectImport>(project.PROJECT_IMPORT)
  readonly importProject = this._actions.pipe(ofType<project.ProjectImport>(project.PROJECT_IMPORT))

  @Effect({ dispatch: false })
  //readonly importVideo = this._actions.ofType<project.ProjectImportVideo>(project.PROJECT_IMPORT_VIDEO)
  readonly importVideo = this._actions.pipe(ofType<project.ProjectImportVideo>(project.PROJECT_IMPORT_VIDEO))

  @Effect({ dispatch: false })
  //readonly exportProject = this._actions.ofType<project.ProjectExport>(project.PROJECT_EXPORT)
  readonly exportProject = this._actions.pipe(ofType<project.ProjectExport>(project.PROJECT_EXPORT))

  @Effect({ dispatch: false })
  //readonly exportProjectAsText = this._actions.ofType<project.ProjectExportAsText>(project.PROJECT_EXPORT_AS_TEXT)
  readonly exportProjectAsText = this._actions.pipe(ofType<project.ProjectExportAsText>(project.PROJECT_EXPORT_AS_TEXT))

  @Effect({ dispatch: false })
  //readonly resetProject = this._actions.ofType<project.ProjectReset>(project.PROJECT_RESET)
  readonly resetProject = this._actions.pipe(ofType<project.ProjectReset>(project.PROJECT_RESET))

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
