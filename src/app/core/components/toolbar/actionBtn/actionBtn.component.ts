import {Component, Input, EventEmitter, Output} from '@angular/core'

@Component({
  selector: 'rv-actionbtn',
  template: `
    <button (click)="btnClick($event)">
      <i [class]="cls" [title]="title"></i><span class="show-for-large"> {{label}}</span>
    </button>
  `,
  styleUrls: ['actionBtn.component.scss']
})
export class ActionBtnComponent {
  @Input() readonly cls: string
  @Input() readonly title: string
  @Input() readonly label: string

  @Output() readonly onClick = new EventEmitter()

  btnClick(event: MouseEvent) {
    this.onClick.emit(event)
  }
}
