import {
  Component, ChangeDetectionStrategy, OnInit,
  OnDestroy, AfterViewInit, Renderer2,
  //ChangeDetectorRef
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'
import * as player from '../../../player/actions'
import {fromEventPattern} from '../../../lib/observable'
import {rndColor} from '../../../lib/color'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'main.html',
  styleUrls: ['main.scss']
})
export class MainContainer implements OnInit, OnDestroy, AfterViewInit {
  private readonly _subs: Subscription[] = []

  constructor(
    //private readonly _cdr: ChangeDetectorRef,
    private readonly _rootStore: Store<fromRoot.State>,
    private readonly _renderer: Renderer2) {}

  ngOnInit() {
    this._rootStore.dispatch(new project.ProjectLoad())

    const windowMousedown = fromEventPattern(this._renderer, window, 'mousedown')
    const windowKeydown = fromEventPattern(this._renderer, window, 'keydown')

    const removeAnnotationHotkey = windowKeydown.filter((e: KeyboardEvent) => e.keyCode === 8)
    const togglePlayingHotkey = windowKeydown.filter((e: KeyboardEvent) => e.keyCode === 32)
    const addTrackHotkey = windowKeydown.filter((e: KeyboardEvent) => {
      return e.keyCode === 187 || // +
        e.keyCode === 221 || // don't know
        e.keyCode === 171    // + (firefox)
    })

    const undoHotkey = windowKeydown.filter((e: KeyboardEvent) => {
      return e.keyCode === 90 && e.metaKey && !e.shiftKey // cmd z (make sure shiftKey is not pressed)
    })

    const redoHotkey = windowKeydown.filter((e: KeyboardEvent) => {
      return e.keyCode === 90 && e.metaKey && e.shiftKey // shift cmd z
    })

    const copyToClipboardHotkey = windowKeydown.filter((e: KeyboardEvent) => {
      return e.keyCode === 67 && e.metaKey // cmd c
    })

    this._subs.push(
      copyToClipboardHotkey.subscribe((ev: KeyboardEvent) => {
        this._rootStore.dispatch(new project.ProjectCopyAnnotationSelectionToClipboard())
      }))

    this._subs.push(
      togglePlayingHotkey.subscribe((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new player.PlayerTogglePlaying())
      }))

    this._subs.push(
      addTrackHotkey.subscribe((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new project.ProjectAddTrack({color: rndColor()}))
      }))

    this._subs.push(
      windowMousedown.subscribe(() => {
        this._rootStore.dispatch(new project.ProjectResetAnnotationSelection())
      }))

    this._subs.push(
      removeAnnotationHotkey
        .subscribe(([_, sel]) => {
          this._rootStore.dispatch(new project.ProjectDeleteSelectedAnnotations())
        }))

    this._subs.push(
      undoHotkey.subscribe((e: KeyboardEvent) => {
        e.preventDefault()
        this._rootStore.dispatch(new project.ProjectUndo())
      }))

    this._subs.push(
      redoHotkey.subscribe((e: KeyboardEvent) => {
        e.preventDefault()
        this._rootStore.dispatch(new project.ProjectRedo())
      }))
  }

  importProject(projectFile: File) {
    this._rootStore.dispatch(new project.ProjectImport(projectFile))
    this.closeProjectModal()
  }

  importVideo(videoImport: project.ImportVideoPayload) {
    this._rootStore.dispatch(new project.ProjectImportVideo(videoImport))
    this.closeProjectModal()
  }

  exportProject() {
    if(window.confirm('Export an archive of the project?')) {
      this._rootStore.dispatch(new project.ProjectExport())
    }
  }

  resetProject() {
    if(window.confirm('Reset the whole project? All data will be lost.')) {
      this._rootStore.dispatch(new project.ProjectReset())
      this.closeProjectModal()
    }
  }

  closeProjectModal() {
    const modal = $('#settings-reveal') as any;
    $('body').removeClass('is-reveal-open')
    modal.foundation('close');
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
