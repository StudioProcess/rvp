import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
//  ElementRef, QueryList, ViewChild, ViewChildren
} from '@angular/core'

import {List, Record, Set} from 'immutable'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/withLatestFrom'

import {Store} from '@ngrx/store'

import * as project from '../../../persistence/actions/project'
import * as fromProject from '../../../persistence/reducers'
import * as fromPlayer from '../../../player/reducers'
import {AnnotationColorMap, Annotation} from '../../../persistence/model'
// import {InspectorEntryComponent} from './inspectorEntry/inspectorEntry.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-inspector',
  template: `
    <div #wrapper *ngIf="annotations !== null" class="wrapper" [style.max-height.px]="height|async">
      <rv-inspector-entry
        *ngFor="let annotation of annotations; trackBy: trackByFunc;"
        [entry]="annotation"
        [isSelected]="isSelectedAnnotation(annotation.annotation)"
        (onUpdate)="updateAnnotation($event)"
        (onSelectAnnotation)="selectAnnotation($event)">
      </rv-inspector-entry>
    </div>`,
  styles: [`
    .wrapper {
      position: relative;
      overflow-y: scroll;
    }
  `]
})
export class InspectorContainer implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('wrapper') private readonly scrollWrapper: ElementRef
  // @ViewChildren(InspectorEntryComponent) private readonly entries: QueryList<InspectorEntryComponent>
  private readonly _subs: Subscription[] = []
  annotations: List<Record<AnnotationColorMap>>
  height = this._playerStore.select(fromPlayer.getDimensions).map(({height}) => height)
  // selectedAnnotations: any
  selectedAnnotations: Set<Record<Annotation>>

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
      this._store.select(fromProject.getSelectedAnnotations)
        .subscribe(selAnnotations => {
          this.selectedAnnotations = selAnnotations
          this._cdr.markForCheck()
        }))
  }

  ngAfterViewInit() {
    // type annotationSelectionWithEntries = [Record<fromSelection.AnnotationSelection>, QueryList<InspectorEntryComponent>]

    // this._subs.push(
    //   this._store.select(fromRoot.getAnnotationSelection)
    //     .filter(annotationSelection => {
    //       if(annotationSelection !== undefined) {
    //         return annotationSelection.getIn(['annotation', 'id']) !== null &&
    //           annotationSelection.get('source', null) === fromSelection.SelectionSource.Timeline
    //       } else {
    //         return false
    //       }
    //     })
    //     .withLatestFrom(this.entries.changes)
    //     .subscribe(([annotationSelection, currentEntries]: annotationSelectionWithEntries) => {
    //       const selectedId = annotationSelection.getIn(['annotation', 'id'])

    //       const entry = currentEntries.find(item => {
    //         return item.entry.getIn(['annotation', 'id']) === selectedId
    //       })

    //       if(entry) {
    //         const wrapper = this.scrollWrapper.nativeElement
    //         const e = entry.elem.nativeElement

    //         // Position centered
    //         wrapper.scrollTop = e.offsetTop - ((wrapper.offsetHeight - e.offsetHeight)/2)
    //       }
    //     }))
  }

  isSelectedAnnotation(annotation: Record<Annotation>) {
    return this.selectedAnnotations ? this.selectedAnnotations.has(annotation) : null
  }

  updateAnnotation(updateAnnotation: project.UpdateAnnotationPayload) {
    this._store.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
  }

  // selectAnnotation(selectAnnotation: selection.SelectionAnnotationPayload) {
  //   this._store.dispatch(new selection.SelectionResetAnnotation())
  //   this._store.dispatch(new selection.SelectionSelectAnnotation(selectAnnotation))
  // }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
