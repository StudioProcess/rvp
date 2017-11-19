import {Component, Input, ChangeDetectionStrategy} from '@angular/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-loading',
  template: `
    <span *ngIf="isLoading">Loading</span>
    <span *ngIf="!isLoading">We're done</span>`
})
export class LoadingComponent {
  @Input() readonly isLoading = false
}
