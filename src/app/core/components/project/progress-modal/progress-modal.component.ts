import {
  OnInit,
  Component,
  ChangeDetectorRef
} from '@angular/core'

import { Subscription } from 'rxjs'
import { MessageService } from '../../../actions/message.service'

@Component({
  selector: 'rv-progress-modal',
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss'],
})
export class ProgressModalComponent implements OnInit {

  text: string = ''
  percent: number = 0
  subscription: Subscription

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private _msg: MessageService
  ) { }

  ngOnInit() {
    this.subscription = this._msg.msgData.subscribe((res: any) => {
      if (res.hasOwnProperty('percent')) { this.updateProgress(res.percent) }
      if (res.hasOwnProperty('text')) { this.updateProgressText(res.text) }
      this._cdr.detectChanges()
    })
  }

  updateProgress(percent: number) {
    this.percent = percent
  }
  updateProgressText(text: string) {
    this.text = text
  }
}
