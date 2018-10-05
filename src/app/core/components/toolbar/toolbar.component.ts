import {Component} from '@angular/core'

@Component({
  selector: 'rv-toolbar',
  template: `
    <div class="toolbar-wrapper">
      <input type="checkbox"> Current Annotations only
    </div>
  `,
  styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent {

}
