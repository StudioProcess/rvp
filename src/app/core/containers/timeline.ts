import {Component} from '@angular/core'

import {Store} from '@ngrx/store'

import * as fromProject from '../../persistence/reducers'

@Component({
  selector: 'rv-timeline',
  template: `
    <pre>{{timeline|async|json}}</pre>
  `,

})
export class TimelineContainer {
  timeline = this._store.select(fromProject.getTimeline)

  constructor(
    private readonly _store: Store<fromProject.State>) {}
}
