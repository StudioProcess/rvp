import {Component, Input, OnInit} from '@angular/core'

@Component({
  selector: 'rv-annotation',
  template: `
    <rv-handlebar [containerLeft]="left" [containerWidth]="width" [caption]="data.fields.title"></rv-handlebar>
  `,
  styles: [`
    rv-handlebar {
      display: inline;
    }
  `]
})
export class AnnotationComponent implements OnInit {
  @Input() data: any
  @Input() totalDuration: number

  left: number
  width: number

  ngOnInit() {
    this.left = this.data.utc_timestamp / this.totalDuration * 100
    this.width = this.data.duration / this.totalDuration * 100
  }
}
