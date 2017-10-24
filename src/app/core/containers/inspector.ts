import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {Subscription} from 'rxjs/Subscription'

import {Store} from '@ngrx/store'

import * as fromProject from '../../persistence/reducers'
import {Annotation, AnnotationColorMap} from '../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector',
  template: `
    <div *ngIf="annotations !== null">
      <rv-inspector-entry
        *ngFor="let annotation of annotations; index as i"
        [entry]="annotation"
        [index]="i"
        (onUpdate)="updateAnnotation($event)">
      </rv-inspector-entry>
    </div>`
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

  updateAnnotation({index, annotation}: {index: number, annotation: Annotation}) {
    // TODO: dispatch update annotation
    console.log(JSON.stringify(index), JSON.stringify(annotation))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
