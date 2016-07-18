import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[zoom], [scroll]'
})
export class ScrollZoom implements OnInit {

  // set width of content element: [px]
  // content element is the first child
  @Input() set zoom(value:number) {
    log.debug('setting zoom', value);
    if (value > 0) {
      this._zoom = value;
      if (this.content) {
        this.content.style.width = this._zoom + "px";
      }
    }
  }

  // set scroll position of container: 0..100 [%]
  // TODO: need to take into account the width of the container
  @Input() set scroll(value:number) {
    log.debug('setting scroll', value);
    if (value >= 0 && value <= 100) {
      this._scroll = value;
      this.container.scrollLeft = this._zoom * this._scroll / 100;
    }
  }

  private _zoom;
  private _scroll;
  private container:HTMLElement;
  private content:HTMLElement;

  constructor(hostElement:ElementRef) {
    this.container = hostElement.nativeElement;
    this.container.style.overflow = 'hidden';
  }

  ngOnInit() {
    this.content = this.container.firstElementChild as HTMLElement;
    setTimeout(() => {
      // trigger setting zoom and scroll, when this.content is available
      this.zoom = this._zoom;
      this.scroll = this._scroll;
    }, 0);
  }
}
