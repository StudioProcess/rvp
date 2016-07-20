import { Component, OnInit, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';

interface DragEvent {
  type:'dragstart'|'drag'|'dragend';
  event:MouseEvent;
  startOffset: {left:number, top:number, width:number; height:number};
  dx:number; // horizontal displacement
  dy:number; // vertical displacement
}

@Component({
  moduleId: module.id,
  selector: 'app-handlebar',
  templateUrl: 'handlebar.component.html',
  styleUrls: ['handlebar.component.css']
})
export class HandlebarComponent implements OnInit {

  // define inputs
  @Input() position:number; // position of left edge (in %)
  @Input() width:number; // width (in %)
  @Input() minWidth:number; // minimum width (in px)
  @Input('container') containerSelector:string; // ancestor to use for positioning
  @Input() caption:string; // caption shown inside handle

  // define outputs
  @Output() drag:EventEmitter<any>; // position and/or width changed

  // dom references
  host:HTMLElement; // host element (app-handlebar)
  handlebar:HTMLElement; // .handlebar-container element
  container:HTMLElement; // element specified via 'container' input, used for sizing and positioning

  // observables
  private centerDrag:Observable<DragEvent>;
  private leftDrag:Observable<DragEvent>;
  private rightDrag:Observable<DragEvent>;

  private centerSubscription;
  private rightSubscription;
  private leftSubscription;

  constructor(hostElement:ElementRef) {
    this.host = hostElement.nativeElement;
  }

  ngOnInit() {
    // find dom references
    this.handlebar = this.host.firstElementChild as HTMLElement;
    if (this.containerSelector) {
      let el = this.host;
      while ( (el = el.parentElement) && !el.matches(this.containerSelector) );
      this.container = el;
    } else {
      // choose parent element by default
      this.container = this.host.parentElement;
    }

    // drag event streams
    this.centerDrag = this.dragStream('.handlebar');
    this.leftDrag = this.dragStream('.left-handle');
    this.rightDrag = this.dragStream('.right-handle');
    // this.centerDrag.subscribe(x => {log.debug(x)});


    this.centerSubscription = this.centerDrag.subscribe(e => {
      this.position = (e.startOffset.left + e.dx) / this.container.offsetWidth * 100;
      // constrain position
      if (this.position < 0) this.position = 0;
      else if (this.position + this.width > 100) this.position = 100 - this.width;
    });

    this.rightSubscription = this.rightDrag.subscribe(e => {
      this.width = (e.startOffset.width + e.dx) / this.container.offsetWidth * 100;
      // constrain width
      if (this.width < 0) this.width = 0;
      else if (this.width > 100 - this.position) this.width = 100 - this.position;
    });

    this.leftSubscription = this.leftDrag.subscribe(e => {
      // constrain movement
      let dx = e.dx;
      if (dx < -e.startOffset.left) dx = -e.startOffset.left;
      else if (dx > e.startOffset.width) dx = e.startOffset.width;
      this.position = (e.startOffset.left + dx) / this.container.offsetWidth * 100;
      this.width = (e.startOffset.width - dx) / this.container.offsetWidth * 100;
    });
  }

  private dragStream(selector):Observable<DragEvent> {
    // stops propagation on the given MouseEvent
    const stopPropagation = (e:MouseEvent) => { e.stopPropagation() };
    // dom event streams
    const el = this.host.querySelector(selector); // dom element with the given selector
    const mousedown$ = Observable.fromEvent(el, 'mousedown').do(stopPropagation);
    const mousemove$ = Observable.fromEvent(document, 'mousemove').do(stopPropagation);
    const mouseup$ = Observable.fromEvent(document, 'mouseup').do(stopPropagation);

    return mousedown$.switchMap((e:MouseEvent) => {
      let startOffset = {
        left: this.handlebar.offsetLeft,
        top: this.handlebar.offsetTop,
        width: this.handlebar.offsetWidth,
        height: this.handlebar.offsetHeight
      };
      let startX = e.screenX;
      let startY = e.screenY;
      let start = Observable.of({type:'dragstart', dx:0, dy:0, event:e, startOffset});
      let drag = mousemove$.takeUntil(mouseup$).map((e:MouseEvent) => {
        return {type:'drag', dx:e.screenX-startX, dy:e.screenY-startY, event:e, startOffset};
      });
      let end = mouseup$.first().map((e:MouseEvent) => {
        return {type:'dragend', dx:e.screenX-startX, dy:e.screenY-startY, event:e, startOffset};
      });
      return start.merge(drag, end).share() as Observable<DragEvent>;
    });
  }
}
