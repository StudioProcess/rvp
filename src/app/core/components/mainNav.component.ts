import {Component} from '@angular/core'

@Component({
  selector: 'rv-main-nav',
  template: `
    <div class="wrapper">
      <div class="row">
        <div class="small-6 column">
          <rv-logo></rv-logo>
        </div>
        <div class="small-6 column text-right">
          <rv-project-btn></rv-project-btn>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      margin-top: 1.4em;
      margin-bottom: 0.5em;
    }
  `]
})
export class MainNavComponent {}
