import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {List, Record} from 'immutable'

import {Subscription} from 'rxjs/Subscription'

import {Store} from '@ngrx/store'

import * as selection from '../actions/selection'
import * as project from '../../persistence/actions/project'
import * as fromSelection from '../reducers'
import * as fromProject from '../../persistence/reducers'
import * as fromPlayer from '../../player/reducers'
import {AnnotationColorMap} from '../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector',
  template: `
    <div *ngIf="annotations !== null" class="wrapper" [style.height.px]="height|async">
      <rv-inspector-entry
        *ngFor="let annotation of annotations; index as i; trackBy: trackByFunc;"
        [entry]="annotation"
        [index]="i"
        [isSelected]="annotation.annotation.id === selectedAnnotationId"
        (onUpdate)="updateAnnotation($event)"
        (onSelectAnnotation)="selectAnnotation($event)">
      </rv-inspector-entry>
    </div>`,
  styles: [`
    .wrapper {
      overflow-y: scroll;
    }
  `]
})
export class InspectorContainer implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = []
  annotations: List<Record<AnnotationColorMap>>
  height = this._playerStore.select(fromPlayer.getDimensions).map(({height}) => height)
  selectedAnnotationId: number | null

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    private readonly _playerStore: Store<fromPlayer.State>) {}

  trackByFunc(_: number, annotation: Record<AnnotationColorMap>) {
    return annotation.getIn(['annotation', 'id'])
  }

  ngOnInit() {
    this._subs.push(
      this._store.select(fromProject.getSortedFlattenedAnnotations)
        .filter(annotations => annotations.size > 0)
        .subscribe(annotations => {
          this.annotations = annotations
          this._cdr.markForCheck()
        }))

    this._subs.push(
      this._store.select(fromSelection.getSelectedAnnotationId)
        .subscribe(id => {
          this.selectedAnnotationId = id
          this._cdr.markForCheck()
        }))
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  selectAnnotation(selectAnnotation: selection.SelectAnnotationPayload) {
    this._store.dispatch(new selection.SelectionResetAnnotation())
    this._store.dispatch(new selection.SelectionSelectAnnotation(selectAnnotation))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
