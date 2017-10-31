import {Component, Input, ChangeDetectionStrategy} from '@angular/core'

import {Track} from '../../../../persistence/model'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-track',
  template: `{{data|json}}`
})
export class TrackComponent {
  @Input() data: Track
}
