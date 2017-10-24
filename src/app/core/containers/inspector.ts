import {Component} from '@angular/core'

import {Store} from '@ngrx/store'

import * as fromProject from '../../persistence/reducers'

@Component({
  selector: 'rv-inspector',
  template: `
    <div>
      <rv-inspector-entry *ngFor="let annotation of annotations | async" [entry]="annotation">
      </rv-inspector-entry>
    </div>
  `
})
export class InspectorContainer {
  readonly annotations = this._store.select(fromProject.getSortedFlattenedAnnotations)

  constructor(
    private readonly _store: Store<fromProject.State>) {}
}
