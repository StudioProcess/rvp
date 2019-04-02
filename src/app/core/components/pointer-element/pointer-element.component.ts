import {
  Component,
  OnInit,
  HostBinding
  //ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div
      class="annotation-pointer-element annotation-pointer-dot"
      [style.left.px]="calculatedX"
    >
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
    }
    .annotation-pointer-element {
      width: 20px;
      height: 20px;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      cursor: move;
    }
  `],
  //encapsulation: ViewEncapsulation.Native
})
export class PointerElementComponent implements OnInit {

  @HostBinding('style.left.px') left: number;
  @HostBinding('style.top.px') top: number;

  constructor() { }

  ngOnInit() {
  }
}
