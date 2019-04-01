import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div class="annotation-pointer-element annotation-pointer-dot">DOT</div>
  `,
  styles: [`
    :host {
    }
  `],
  encapsulation: ViewEncapsulation.Native
})
export class PointerElementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
