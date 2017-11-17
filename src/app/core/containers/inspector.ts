import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {List, Record} from 'immutable'

import {Subscription} from 'rxjs/Subscription'

import {Store} from '@ngrx/store'

import * as project from '../../persistence/actions/project'
import * as fromProject from '../../persistence/reducers'
import * as fromPlayer from '../../player/reducers'
import {AnnotationColorMap} from '../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector',
  template: `
    <div *ngIf="annotations !== null" class="wrapper" [style.height.px]="height|async">
      <rv-inspector-entry
        *ngFor="let annotation of annotations; index as i"
        [entry]="annotation"
        [index]="i"
        (onUpdate)="updateAnnotation($event)">
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
  annotations: List<Record<AnnotationColorMap>>|null
  height = this._playerStore.select(fromPlayer.getDimensions).map(({height}) => height)

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>,
    private readonly _playerStore: Store<fromPlayer.State>) {}

  ngOnInit() {
    this._subs.push(
      this._store.select(fromProject.getSortedFlattenedAnnotations)
        .subscribe(annotations => {
          this.annotations = annotations
          this._cdr.markForCheck()
        }))
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
