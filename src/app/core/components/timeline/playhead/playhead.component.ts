import {Component, ChangeDetectionStrategy, Input} from '@angular/core'

import {formatDuration} from '../../../../lib/time'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-playhead',
  template: `<span class="timelabel">{{format(currentTime)}}</span>`,
  styleUrls: ['playhead.component.scss']
})
export class PlayheadComponent {
  @Input() readonly currentTime: number

  format = formatDuration
}
