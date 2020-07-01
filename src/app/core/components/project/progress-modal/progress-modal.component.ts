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
  error: boolean = false
  close: boolean = false
  subscription: Subscription

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private _msg: MessageService
  ) {}

  ngOnInit() {
    this.subscription = this._msg.msgData.subscribe((res: any) => {
      this.percent = (res.hasOwnProperty('percent') ? res.percent : 0 )
      this.text = (res.hasOwnProperty('text') ? res.text : '' )
      this.error = (res.hasOwnProperty('error') ? res.error : false )
      this.close = (res.hasOwnProperty('close') ? res.close : false )
      this._cdr.detectChanges()
    })
  }
}
