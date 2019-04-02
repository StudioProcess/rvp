import {
  Component,
  OnInit,
  //ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div class="annotation-pointer-element annotation-pointer-dot"></div>
  `,
  styles: [`
    :host {
    }
    .annotation-pointer-element {
      position: absolute;
      width: 20px;
      height: 20px;
      background: red;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
    }
  `],
  //encapsulation: ViewEncapsulation.None
})
export class PointerElementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
