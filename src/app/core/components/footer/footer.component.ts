import {Component} from '@angular/core'

@Component({
  selector: 'rv-footer',
  template: `
    <strong>
      Research Video is a project by <a href="http://zhdk.ch">Zurich University of the Arts</a> and <a href="http://process.studio">Studio Process</a>.
    </strong>`,
  styleUrls: ['footer.component.scss']
})
export class FooterComponent {}
