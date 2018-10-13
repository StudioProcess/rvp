import {
  Component, ChangeDetectionStrategy, OnInit,
  OnDestroy, AfterViewInit,
  // ChangeDetectorRef
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Observable, Subscription, fromEvent} from 'rxjs'
import {filter} from 'rxjs/operators'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'
import * as fromProject from '../../../persistence/reducers'
import * as player from '../../../player/actions'
import {rndColor} from '../../../lib/color'
import {AnnotationRecordFactory, AnnotationFieldsRecordFactory} from '../../../persistence/model'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'main.html',
  styleUrls: ['main.scss']
})
export class MainContainer implements OnInit, OnDestroy, AfterViewInit {
  currentAnnotationsOnly: boolean = false // show current annotations only
  search: string|null = null
  applyToTimeline: boolean = false
  private readonly _subs: Subscription[] = []

  constructor(
    // private readonly _cdr: ChangeDetectorRef,
    private readonly _rootStore: Store<fromRoot.State>) {}

  ngOnInit() {
    this._rootStore.dispatch(new project.ProjectLoad())

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
    const windowKeydown = fromEvent(window,  'keydown') as Observable<KeyboardEvent>

    // backspace key
    const removeAnnotationHotkey = windowKeydown.pipe(filter(e => e.keyCode === 8))

    // space key
    const togglePlayingHotkey = windowKeydown.pipe(filter(e => e.keyCode === 32))

    // + key
    const addTrackHotkey = windowKeydown.pipe(filter(e => {
      return e.keyCode === 187 || // +
        e.keyCode === 221 || // don't know
        e.keyCode === 171    // + (firefox)
    }))

    // cmd z
    const undoHotkey = windowKeydown.pipe(filter(e => {
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
      copyToClipboardHotkey.subscribe(() => {
        this._rootStore.dispatch(new project.ProjectCopyAnnotationSelectionToClipboard())
      }))

    this._subs.push(
      togglePlayingHotkey.subscribe(ev => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new player.PlayerTogglePlaying())
      }))

    this._subs.push(
      addTrackHotkey.subscribe(ev => {
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
        .subscribe(() => {
          this._rootStore.dispatch(new project.ProjectDeleteSelectedAnnotations())
        }))

    this._subs.push(
      undoHotkey.subscribe(e => {
        e.preventDefault()
        this._rootStore.dispatch(new project.ProjectUndo())
      }))

    this._subs.push(
      redoHotkey.subscribe(e => {
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
    const modal = $('#settings-reveal') as any
    // $('body').removeClass('is-reveal-open')
    modal.foundation('close')
  }

  addAnnotation() {
    this._rootStore.dispatch(new project.ProjectAddAnnotation({
      trackIndex: 0,
      annotationStackIndex: 0,
      annotation: AnnotationRecordFactory({
        utc_timestamp: 0,
        duration: 30,
        fields: AnnotationFieldsRecordFactory({title: '* NEW *'})
      })
    }))
  }

  currentAnnotationsOnlyChange(currentAnnotationsOnly: boolean) {
    this._rootStore.dispatch(new project.ProjectSettingsSetCurrentAnnotationsOnly(currentAnnotationsOnly))
  }

  searchChange(search: string|null) {
    this._rootStore.dispatch(new project.ProjectSettingsSetSearch(search))
  }

  applyToTimelineChange(applyToTimeline: boolean) {
    this._rootStore.dispatch(new project.ProjectSettingsSetApplyToTimeline(applyToTimeline))
  }

  ngAfterViewInit() {
    $(document).foundation()
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
