import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {Subscription} from 'rxjs/Subscription'

import {Store} from '@ngrx/store'

import * as project from '../../persistence/actions/project'
import * as fromProject from '../../persistence/reducers'
import {Annotation, AnnotationColorMap} from '../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector',
  template: `
    <div *ngIf="annotations !== null" class="wrapper">
      <rv-inspector-entry
        *ngFor="let annotation of annotations; index as i"
        [entry]="annotation"
        [index]="i"
        (onUpdate)="updateAnnotation($event)">
      </rv-inspector-entry>
    </div>`,
  styles: [`
    .wrapper {
      max-height: 200px;
      overflow-y: scroll;
    }
  `]
})
export class InspectorContainer implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = []
  annotations: AnnotationColorMap[]|null

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromProject.State>) {}

  ngOnInit() {
    this._subs.push(
      this._store.select(fromProject.getSortedFlattenedAnnotations)
        .subscribe(annotations => {
          this.annotations = annotations
          this._cdr.markForCheck()
        }))
  }

  updateAnnotation({index, trackIndex, annotation}: {index: number, trackIndex: number, annotation: Annotation}) {
    this._store.dispatch(new project.ProjectUpdateAnnotation({annotationIndex: index, trackIndex, annotation}))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
