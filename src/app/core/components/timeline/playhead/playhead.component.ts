import {Component, ChangeDetectionStrategy} from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-playhead',
  template: `<span class="timelabel">00:00:00.000</span>`,
  styleUrls: ['playhead.component.scss']
})
export class PlayheadComponent {}
