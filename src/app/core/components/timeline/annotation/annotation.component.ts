import {Component, Input} from '@angular/core'

@Component({
  selector: 'rv-annotation',
  template: `<pre>{{data|json}}</pre>`
})
export class AnnotationComponent {
  @Input() data: any
}
