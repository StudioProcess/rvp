import {Component, Input} from '@angular/core'

@Component({
  selector: 'rv-actionbtn',
  template: `
    <i [class]="cls" [title]="title"></i> {{label}}
  `
})
export class ActionBtnComponent {
  @Input() readonly cls: string
  @Input() readonly title: string
  @Input() readonly label: string
}
