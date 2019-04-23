import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'rv-tagging',
  template: `
    <span style="display: inline-block; background-color:red;">
      tagging
    </span>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Native
})
export class TaggingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
