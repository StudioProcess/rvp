import {Component, Input, ChangeDetectionStrategy} from '@angular/core'

import {Track} from '../../../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  template: `
    <div class="row">
      <div class="column shrink">
        <div [style.color]="data.color">
          <i class="ion-record" title="Track Color"></i>
          <input placeholder="Track Title" title="Track Title">
        </div>
      </div>
    </div>
  `
})
export class TrackComponent {
  @Input() data: Track
}
