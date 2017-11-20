import {
  Component, ChangeDetectionStrategy, OnInit,
  OnDestroy, AfterViewInit, Renderer2,
  ChangeDetectorRef
} from '@angular/core'

import {Store} from '@ngrx/store'

import {Subscription} from 'rxjs/Subscription'

import * as fromRoot from '../../reducers'
import * as project from '../../../persistence/actions/project'
import * as selection from '../../actions/selection'
import * as io from '../../../io/actions/io'
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

  private _isLoading = false

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _rootStore: Store<fromRoot.State>,
    private readonly _renderer: Renderer2) {}

  ngOnInit() {
    this._subs.push(this._rootStore.select(fromRoot.getIsLoading)
      .subscribe(isLoading => {
        this._isLoading = isLoading
      }))

    const backspace = fromEventPattern(this._renderer, window, 'keydown').filter((e: KeyboardEvent) => e.keyCode === 8)

    const deselectAnnotation = backspace
      .withLatestFrom(this._rootStore.select(fromRoot.getAnnotationSelection))
      .filter(([_, selection]) => selection !== undefined)

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

    this._rootStore.dispatch(new project.ProjectLoad())
  }

  openProject() {
    console.log('TODO: open project')
  }

  exportProject() {
    if(window.confirm('Export an archive of the project?')){
      this._rootStore.dispatch(new io.IOExportProject())
    }
  }

  resetProject() {
    console.log('TODO: reset project')
  }

  changeVideo() {
    console.log('TODO: change video')
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe())
  }
}
