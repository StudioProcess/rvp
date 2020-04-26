import {Component, ChangeDetectionStrategy, Input, HostBinding} from '@angular/core'

import {formatDuration} from '../../../../lib/time'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-playhead',
  template: `<span class="timelabel" #label [ngStyle]="{'left': 'calc(-'+label.offsetWidth/2.05+' * '+left+'%)'}">{{format(currentTime)}}</span>`,
  styleUrls: ['playhead.component.scss']
})
export class PlayheadComponent {
  @Input() readonly currentTime: number
  @Input() readonly left: number

  @HostBinding('style.left.%')
  get style(): number {
    return this.left
  }

  format = formatDuration
}
