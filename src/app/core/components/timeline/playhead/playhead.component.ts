import {Component, ChangeDetectionStrategy, Input, HostBinding, OnInit, ChangeDetectorRef} from '@angular/core'

import {formatDurationCombined} from '../../../../lib/time'
import {Store} from '@ngrx/store'
import * as fromRoot from '../../../reducers'
import * as fromProject from '../../../../persistence/reducers'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-playhead',
  template: `<span class="timelabel" #label [ngStyle]="{'left': 'calc(-'+label.offsetWidth/2.05+' * '+left+'%)'}">{{format(currentTime)}}</span>`,
  styleUrls: ['playhead.component.scss']
})
export class PlayheadComponent implements OnInit {
  @Input() readonly currentTime: number
  @Input() readonly left: number

  @HostBinding('style.left.%')
  get style(): number {
    return this.left
  }

  private formatSecond: boolean
  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _store: Store<fromRoot.State>,
  ) {
  }

  format(time: number) {
    return formatDurationCombined(time, this.formatSecond)
  }

  ngOnInit(): void {
    this._store.select(fromProject.getProjectSettingsFormatSeconds)
      .subscribe(formatSecond => {
        this.formatSecond = formatSecond
        this._cdr.markForCheck()
      })
  }
}
