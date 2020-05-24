import {
  Component, ChangeDetectionStrategy, OnInit,
  OnDestroy, AfterViewInit,
  ChangeDetectorRef
} from '@angular/core'

import { Title } from '@angular/platform-browser'

import { Store } from '@ngrx/store'
import { ActivatedRoute } from '@angular/router'

import { Observable, Subscription, fromEvent } from 'rxjs'
import { filter, pairwise, withLatestFrom } from 'rxjs/operators'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'
import * as fromProject from '../../../persistence/reducers'
import { rndColor } from '../../../lib/color'
import { AnnotationRecordFactory, AnnotationFieldsRecordFactory } from '../../../persistence/model'
import { _EMPTY_PROJECT_ } from '../../../config/project'
import { Globals } from '../../../common/globals'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'main.html',
  styleUrls: ['main.scss']
})
export class MainContainer implements OnInit, OnDestroy, AfterViewInit {
  hasSelectedAnnotations: boolean = false
  hasClipboardAnnotations: boolean = false
  hasRedo: boolean = false
  hasUndo: boolean = false
  hasTracks: boolean = false
  hasActiveTrack: boolean = false
  currentAnnotationsOnly: boolean = false // show current annotations only
  search: string | null = null
  applyToTimeline: boolean = false
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _rootStore: Store<fromRoot.State>,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
  ) {
    // TODO : check whether viewmode is active
    Globals.viewmode_active = true
  }

  ngOnInit() {

    $(document).foundation()

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('video') && params.hasOwnProperty('annotations')) {
        const mediArchiveModal = $('#medi-archive-modal') as any
        mediArchiveModal.foundation('open')
      }
    })

    this._rootStore.dispatch(new project.ProjectLoad())

    // set document title
    this._rootStore.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {
        const title = meta.getIn(['general', 'title'])! as string
        this.titleService.setTitle(title)
      }
    })

    this._subs.push(this._rootStore.select(fromProject.getProjectFocusAnnotationSelection).subscribe(selected => {
      this.hasSelectedAnnotations = selected !== null
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectClipboard).subscribe(clipboard => {
      this.hasClipboardAnnotations = clipboard.size > 0
      this._cdr.markForCheck()
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectTimeline).subscribe(timeline => {
      if (timeline !== null) {
        const tracks = timeline.get('tracks', null)
        this.hasTracks = tracks.size > 0
      } else {
        this.hasTracks = false
      }
    }))

    const hasActiveTrack = this._rootStore.select(fromProject.getProjectHasActiveTrack)

    this._subs.push(hasActiveTrack.subscribe(hasActiveTrack => {
      this.hasActiveTrack = hasActiveTrack
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectSnapshots).subscribe(snapshots => {
      this.hasRedo = snapshots.redo.size > 0
      this.hasUndo = snapshots.undo.size > 0
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectSettingsShowCurrentAnnotationsOnly).subscribe(currentAnnotationsOnly => {
      this.currentAnnotationsOnly = currentAnnotationsOnly
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectSettingsSearch).subscribe(search => {
      this.search = search
    }))

    this._subs.push(this._rootStore.select(fromProject.getProjectSettingsApplyToTimeline).subscribe(applyToTimeline => {
      this.applyToTimeline = applyToTimeline
    }))

    const windowMousedown = fromEvent(window, 'mousedown') as Observable<MouseEvent>
    const windowKeydown = fromEvent(window, 'keydown') as Observable<KeyboardEvent>

    const windowKeydownPairs = windowKeydown.pipe(pairwise())

    // A + enter (shift a + enter)
    const addAnnotationHotkey = windowKeydownPairs.pipe(filter(([e1, e2]) => {
      return e1.keyCode === 65 && e1.shiftKey === true && // shift A
        e2.keyCode === 13 // enter
    }))

    // Prevent default enter key
    this._subs.push(
      windowKeydown.pipe(filter(e => e.keyCode === 13))
        .subscribe(e => {
          e.preventDefault()
        }))

    // cmd v
    const pasteHotkey: Observable<KeyboardEvent> = windowKeydown
      .pipe(
        filter((ev: KeyboardEvent) => {
          return ev.keyCode === 86 && ev.metaKey
        }))

    // backspace key
    // const removeAnnotationHotkey = windowKeydown.pipe(filter(e => e.keyCode === 8))
    // moved to shift + "Delete" key
    const removeAnnotationHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 46 && e.shiftKey // shift + del
    }))

    // space key
    const togglePlayingHotkey = windowKeydown.pipe(filter(e => e.keyCode === 32))

    // + key
    const addTrackHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 187 || // +
        e.keyCode === 221 || // don't know
        e.keyCode === 171    // + (firefox)
    }))

    // cmd z
    const undoHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 90 && e.metaKey && !e.shiftKey // cmd z (make sure shiftKey is not pressed)
    }))

    // shift cmd z
    const redoHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 90 && e.metaKey && e.shiftKey // shift cmd z
    }))

    // cmd c
    const copyToClipboardHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 67 && e.metaKey // cmd c
    }))

    this._subs.push(
      addAnnotationHotkey.pipe(
        withLatestFrom(hasActiveTrack),
        filter(([, hasActiveTrack]) => hasActiveTrack === true))
        .subscribe(() => {
          this.addAnnotation()
        }))

    this._subs.push(
      pasteHotkey
        .subscribe(() => {
          this.pasteAnnotation()
        }))

    this._subs.push(
      copyToClipboardHotkey.subscribe(() => {
        this.dispatchCopyAnnotation()
      }))

    this._subs.push(
      togglePlayingHotkey.subscribe(ev => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new project.PlayerTogglePlaying())
      }))

    this._subs.push(
      addTrackHotkey.subscribe(ev => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new project.ProjectAddTrack({ color: rndColor() }))
      }))

    this._subs.push(
      windowMousedown.subscribe(() => {
        this._rootStore.dispatch(new project.ProjectResetAnnotationSelection())
      }))

    this._subs.push(
      removeAnnotationHotkey
        .subscribe(() => {
          this.dispatchDeleteAnnotation()
        }))

    this._subs.push(
      undoHotkey.subscribe(e => {
        e.preventDefault()
        this.dispatchUndoAction()
      }))

    this._subs.push(
      redoHotkey.subscribe(e => {
        e.preventDefault()
        this.dispatchRedoAction()
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
    if (window.confirm('Export an archive of the project?')) {
      this._rootStore.dispatch(new project.ProjectExport())
    }
  }

  exportProjectAsText(type: string) {
    this._rootStore.dispatch(new project.ProjectExportAsText(type))
  }

  resetProject(info?: boolean) {
    if (typeof info !== 'undefined' && info === false) {
      this._rootStore.dispatch(new project.ProjectReset())
    } else {
      if (window.confirm('Reset the whole project? All data will be lost.')) {
        this._rootStore.dispatch(new project.ProjectReset())
        this.closeProjectModal()
      }
    }
  }

  newProject() {
    if (window.confirm('Create a new (empty) project? All data will be lost.')) {
      this._rootStore.dispatch(new project.ProjectLoadSuccess(_EMPTY_PROJECT_))
      this.closeProjectModal()
    }
  }

  importProjectMeta(metaData: any) {
    this._rootStore.dispatch(new project.ProjectLoadSuccess(metaData))
  }

  closeProjectModal() {
    const modal = $('#settings-reveal') as any
    modal.foundation('close')
  }

  addAnnotation() {
    this._rootStore.dispatch(new project.ProjectAddAnnotation({
      source: 'toolbar',
      trackIndex: 0,
      annotationStackIndex: 0,
      annotation: AnnotationRecordFactory({
        utc_timestamp: 0,
        duration: 1,
        fields: AnnotationFieldsRecordFactory({ description: '' })
      })
    }))
  }

  updateProjectTitle(updateTitle: project.ProjectUpdateTitle) {
    // console.log ('updateProjectTitle', updateTitle);
    this._rootStore.dispatch(new project.ProjectUpdateTitle(updateTitle))
  }

  private dispatchDeleteAnnotation() {
    this._rootStore.dispatch(new project.ProjectDeleteSelectedAnnotations())
  }

  private dispatchCopyAnnotation() {
    this._rootStore.dispatch(new project.ProjectCopyAnnotationSelectionToClipboard())
  }

  private dispatchUndoAction() {
    this._rootStore.dispatch(new project.ProjectUndo())
  }

  private dispatchRedoAction() {
    this._rootStore.dispatch(new project.ProjectRedo())
  }

  deleteAnnotation() {
    this.dispatchDeleteAnnotation()
  }

  copyAnnotation() {
    this.dispatchCopyAnnotation()
  }

  pasteAnnotation() {
    this._rootStore.dispatch(new project.ProjectPasteClipBoard())
  }

  undoAction() {
    this.dispatchUndoAction()
  }

  redoAction() {
    this.dispatchRedoAction()
  }

  currentAnnotationsOnlyChange(currentAnnotationsOnly: boolean) {
    this._rootStore.dispatch(new project.ProjectSettingsSetCurrentAnnotationsOnly(currentAnnotationsOnly))
  }

  searchChange(search: string | null) {
    this._rootStore.dispatch(new project.ProjectSettingsSetSearch(search))
  }

  applyToTimelineChange(applyToTimeline: boolean) {
    this._rootStore.dispatch(new project.ProjectSettingsSetApplyToTimeline(applyToTimeline))
  }

  ngAfterViewInit() {
    // $(document).foundation()
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
