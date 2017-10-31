import {Component} from '@angular/core'

@Component({
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar-container">
      <div class="handlebar">
        <div class="left-handle"><i class="ion-arrow-right-b"></i></div>
        <div class="content">{{caption}}</div>
        <div class="right-handle"><i class="ion-arrow-left-b"></i></div>
      </div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent {
  readonly caption = '|||'
}
