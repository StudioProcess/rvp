import {Component} from '@angular/core'

@Component({
  selector: 'rv-menu',
  template: `
    <div class="row">
      <div class="small-6 column">
        <rv-logo></rv-logo>
      </div>
      <div class="small-6 column text-right">
        <rv-project-btn></rv-project-btn>
      </div>
    </div>
  `
})
export class MenuComponent {}
