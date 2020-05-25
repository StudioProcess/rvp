import { Component } from '@angular/core'
import { Globals } from '../../common/globals'

@Component({
  selector: 'rv-viewmode',
  template: `
    <div class="viewmode-wrapper" *ngIf="viewmode_active" (click)="toggleViewMode($event)">
      <i class="ion-md-eye"></i>
    </div>
  `,
  styles: [`
    .viewmode-wrapper {
      display: inline-block;
      position: relative;
      top: 4px;
      margin: 0 0 0 20px;

    }
    .viewmode-wrapper i {
      font-size: 28px;
    }
  `]
})
export class ViewmodeComponent {

  viewmode_active: boolean = false

  constructor() {
  }

  ngOnInit() {
    this.viewmode_active = Globals.viewmode_active
  }

  toggleViewMode($event: MouseEvent) {
    console.log('toggle', Globals.viewmode_active)
    Globals.viewmode_active = ((Globals.viewmode_active) ? false : true)

  }
}
