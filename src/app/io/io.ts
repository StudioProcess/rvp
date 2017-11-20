import {Injectable, OnDestroy} from '@angular/core'

import {Store} from '@ngrx/store'
import {Effect, Actions} from '@ngrx/effects'

import * as JSZip from 'jszip'
import {saveAs} from 'file-saver'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'

import * as fromProject from '../persistence/reducers'
import * as io from './actions/io'
import {_DEFZIPOTPIONS_} from '../config/zip'

@Injectable()
export class IOEffects implements OnDestroy {
  private readonly _subs: Subscription[] = []
  constructor(
    private readonly _actions: Actions,
    private readonly _store: Store<fromProject.State>) {
      this._subs.push(
        this.exportProject.subscribe(async ([, project]) => {
          const projectData = {
            id: project.get('id', null)!,
            timeline: project.get('timeline', null)!.toJS()
          }

          const videoData = project.get('video', null)!

          const zip = new JSZip()
          zip.file('project/project.json', JSON.stringify(projectData))
          zip.file('project/video.m4v', videoData)

          try {
            const zipBlob = await zip.generateAsync(_DEFZIPOTPIONS_) as Blob
            saveAs(zipBlob, 'project.zip')
          } catch(err) {
            console.log(err)
          }
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
