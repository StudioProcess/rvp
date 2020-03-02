import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class MessageService {
  msgSource = new BehaviorSubject<any>(0)
  msgData = this.msgSource.asObservable()

  update(newMsg: any) {
    this.msgSource.next(newMsg)
  }
}
