import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class Globals {
  public static viewmode_active: boolean = false
  private viewmode_active_behavior: BehaviorSubject<boolean>

  constructor() {
    this.viewmode_active_behavior = new BehaviorSubject<boolean>(false)
  }

  getValue(): Observable<boolean> {
    return this.viewmode_active_behavior.asObservable()
  }
  setValue(newValue: boolean): void {
    this.viewmode_active_behavior.next(newValue)
  }
}
