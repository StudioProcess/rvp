import { Component } from '@angular/core'

@Component({
  selector: 'rv-viewmode',
  template: `
    <div class="viewmode-wrapper" *ngIf="is_shown">
      <i class="ion-md-eye"></i>
    </div>
  `,
  styles: [`
    .viewmode-wrapper {
      display: inline-block;
      position: relative;
      top: 3px;
      margin: 0 0 0 20px;

    }
    .viewmode-wrapper i {
      font-size: 26px;
    }
  `]
})
export class ViewmodeComponent {

  is_shown: boolean = true
}
