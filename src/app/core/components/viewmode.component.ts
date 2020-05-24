import { Component } from '@angular/core'

@Component({
  selector: 'rv-viewmode',
  template: `
    <div class="viewmode-wrapper">
      <i class="ion-eye-outline"></i>
    </div>
  `,
  styles: [`
    .viewmode-wrapper {
      padding: 5px;
      display: inline-block;
    }
  `]
})
export class ViewmodeComponent { }
