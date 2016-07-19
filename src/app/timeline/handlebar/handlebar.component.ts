import { Component, OnInit, Input, ElementRef, Output } from '@angular/core';
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
  @Input() position:number;
  @Input() width:number;
  @Input() handlebarColor:string;
  @Input() text:string;
  @Input() minWidth:number;
  @Input('container') containerSelector:string;

  // define outputs


  isCircle: boolean = false;
  host:HTMLElement;
  handlebar:HTMLElement;
  container:HTMLElement;

  private centerDrag:Observable<DragEvent>;
  private leftDrag:Observable<DragEvent>;
  private rightDrag:Observable<DragEvent>;

  private centerSubscription;

  constructor(hostElement:ElementRef) {
    this.host = hostElement.nativeElement;
  }

  ngOnInit() {
    // drag event streams
    this.centerDrag = this.dragStream('.handlebar');
    this.leftDrag = this.dragStream('.left-handle');
    this.rightDrag = this.dragStream('.right-handle');
    // this.centerDrag.subscribe(x => {log.debug(x)});


    // check if length shorter than minimum width
    if((this.width <= this.minWidth) && (this.width != 0)) {
      this.width = this.minWidth;
    }

    //check if width under minimum length
    if((this.width < 1) && (this.width != 0)) {
      this.width = 1;
      this.isCircle = true;
    }

    this.handlebar = this.host.firstElementChild as HTMLElement;

    // find reference element to use for sizing and positioning
    if (this.containerSelector) {
      let el = this.host;
      while ( (el = el.parentElement) && !el.matches(this.containerSelector) );
      this.container = el;
    } else {
      // choose parent element by default
      this.container = this.host.parentElement;
    }

    this.centerSubscription = this.centerDrag.subscribe(e => {
      // log.debug(e);
      this.position = (e.startOffset.left + e.dx) / this.container.offsetWidth * 100;
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
