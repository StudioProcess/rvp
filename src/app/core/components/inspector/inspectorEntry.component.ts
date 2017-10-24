import {Component, Input} from '@angular/core'

import {AnnotationColorMap} from '../../../persistence/model'

@Component({
  selector: 'rv-inspector-entry',
  template: `
    <div class="row collapse">
      <div class="column shrink">
        <div class="annotation-color" [style.backgroundColor]="entry.color"></div>
      </div>
      <div class="column">
        <span>{{entry.annotation.fields.title}}</span>
        <pre>{{entry|json}}</pre>
      </div>
    </div>
  `,
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent {
  @Input() entry: AnnotationColorMap
}
