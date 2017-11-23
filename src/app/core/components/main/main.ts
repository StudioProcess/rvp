import {
  Component, ChangeDetectionStrategy, OnInit,
  OnDestroy, AfterViewInit, Renderer2,
  ChangeDetectorRef
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'
import * as selection from '../../actions/selection'
import * as player from '../../../player/actions'
import {fromEventPattern} from '../../../lib/observable'

declare var $: any

@Component({
  selector: 'rv-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'main.html',
  styleUrls: ['main.scss']
})
export class MainContainer implements OnInit, OnDestroy, AfterViewInit {
  private readonly _subs: Subscription[] = []

  _isLoading = false

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _rootStore: Store<fromRoot.State>,
    private readonly _renderer: Renderer2) {}

  ngOnInit() {
    this._rootStore.dispatch(new project.ProjectLoad())

    const windowMousedown = fromEventPattern(this._renderer, window, 'mousedown')
    const windowKeydown = fromEventPattern(this._renderer, window, 'keydown')

    const backspace = windowKeydown.filter((e: KeyboardEvent) => e.keyCode === 8)
    const space = windowKeydown.filter((e: KeyboardEvent) => e.keyCode === 32)

    const annotationSelection = this._rootStore.select(fromRoot.getAnnotationSelection).share()

    const deselectAnnotation = backspace
      .withLatestFrom(annotationSelection)
      .filter(([_, selection]) => selection !== undefined)

    this._subs.push(this._rootStore.select(fromRoot.getIsLoading)
      .subscribe(isLoading => {
        this._isLoading = isLoading
      }))

    this._subs.push(
      space.subscribe((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this._rootStore.dispatch(new player.PlayerTogglePlaying())
      }))

    this._subs.push(
      windowMousedown.withLatestFrom(annotationSelection.filter(selection => selection !== undefined))
        .subscribe(([, sel]) => {
          const deselectPayload = {selection: sel!}
          this._rootStore.dispatch(new selection.SelectionDeselectAnnotation(deselectPayload))
        }))

    this._subs.push(
      deselectAnnotation
        .subscribe(([_, sel]) => {
          const deselectPayload = {selection: sel!}
          this._rootStore.dispatch(new selection.SelectionDeselectAnnotation(deselectPayload))

          const deletePayload = {
            trackIndex: sel!.get('trackIndex', null),
            annotationIndex: sel!.get('annotationIndex', null),
            annotation: sel!.get('annotation', null)
          }
          this._rootStore.dispatch(new project.ProjectDeleteAnnotation(deletePayload))
          this._cdr.markForCheck()
        }))
  }

  importProject(projectFile: File) {
    this._rootStore.dispatch(new project.ProjectImport(projectFile))
    this.closeProjectModal()
  }

  importVideo(video: File) {
    this._rootStore.dispatch(new project.ProjectImportVideo(video))
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
    modal.foundation('close');
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
