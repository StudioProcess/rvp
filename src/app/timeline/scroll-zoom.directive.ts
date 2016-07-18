import { Directive, Input, ElementRef, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[scroll], [zoom]'
})
export class ScrollZoom implements OnInit, AfterViewInit {

  // 0..100 (%)
  // @Input() scroll:number) {
  //
  // }

  // width of content
  @Input() zoom:number = 1000;

  @Input() scroll:number = 0;

  private container:HTMLElement;
  private content:HTMLElement;

  constructor(hostElement:ElementRef) {
    this.container = hostElement.nativeElement;
    this.container.style.overflow = 'hidden';
    this.container.scrollLeft = this.scroll;
    log.debug(this.container);
  }

  ngOnInit() {
     this.content = this.container.firstElementChild as HTMLElement;
     this.content.style.width = this.zoom + "px";
    //  log.debug(this.content, this.zoom);
  }

  ngAfterViewInit() {

  }

}
