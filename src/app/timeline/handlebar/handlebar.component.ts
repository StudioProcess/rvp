import { Component, OnInit, Input, ElementRef, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

interface DragEvent {
  type:'dragstart'|'drag'|'dragend';
  event:MouseEvent;
}

interface CustomDragEvent {
  type:'dragstart'|'drag'|'dragend';
  dx:number; // horizontal displacement
  dy:number; // vertival displacement
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
  @Output() centerDrag:Observable<DragEvent>;
  @Output() leftDrag:Observable<DragEvent>;
  @Output() rightDrag:Observable<DragEvent>;

  isCircle: boolean = false;
  host:HTMLElement;
  container:HTMLElement;

  private customCenterDrag:Observable<CustomDragEvent>;

  constructor(hostElement:ElementRef) {
    this.host = hostElement.nativeElement;
  }

  ngOnInit() {
    // publish drag event streams
    this.centerDrag = this.dragStream('.handlebar');
    this.leftDrag = this.dragStream('.left-handle');
    this.rightDrag = this.dragStream('.right-handle');


    this.customCenterDrag = this.customDragStream('.handlebar');
    this.customCenterDrag.subscribe(x => {log.debug(x)});


    // check if length shorter than minimum width
    if((this.width <= this.minWidth) && (this.width != 0)) {
      this.width = this.minWidth;
    }

    //check if width under minimum length
    if((this.width < 1) && (this.width != 0)) {
      this.width = 1;
      this.isCircle = true;
    }

    // find reference element to use for sizing and positioning
    if (this.containerSelector) {
      let el = this.host;
      while ( (el = el.parentElement) && !el.matches(this.containerSelector) );
      this.container = el;
    } else {
      // choose parent element by default
      this.container = this.host.parentElement;
    }
    // log.debug('handlebar container', this.container);

    // this.centerDrag.subscribe((e) => { log.debug('centerDrag', e) });
    // this.leftDrag.subscribe((e) => { log.debug('leftDrag', e) });
    // this.rightDrag.subscribe((e) => { log.debug('rightDrag', e) });
  }

  private dragStream(selector:string):Observable<DragEvent> {
    // helper functions:
    // stops propagation on the given MouseEvent
    const stopPropagation = (e:MouseEvent) => { e.stopPropagation() };
    // returns a function that wraps a MouseEvent with the type property and returns a DragEvent
    const wrapEvent = (type:'dragstart'|'drag'|'dragend') => ( (event:MouseEvent):DragEvent => {return {type, event}} );

    // dom event streams
    const el = this.host.querySelector(selector); // dom element with the given selector
    const mousedown$ = Observable.fromEvent(el, 'mousedown').do(stopPropagation);
    const mousemove$ = Observable.fromEvent(el, 'mousemove').do(stopPropagation);
    const mouseup$ = Observable.fromEvent(el, 'mouseup').do(stopPropagation);

    let drag = mousedown$.flatMap( () => mousemove$.skip(1).takeUntil(mouseup$) ).map( wrapEvent('drag') );
    let start = mousedown$.flatMap( () => mousemove$.first() ).map( wrapEvent('dragstart') );
    let end = start.flatMap( () => mouseup$.first() ).map( wrapEvent('dragend') );
    const up$ = Observable.fromEvent(el, 'mouseup');
    return drag.merge(start, end);
  }

  private customDragStream(selector):Observable<CustomDragEvent> {
    // stops propagation on the given MouseEvent
    const stopPropagation = (e:MouseEvent) => { e.stopPropagation() };
    // dom event streams
    const el = this.host.querySelector(selector); // dom element with the given selector
    const mousedown$ = Observable.fromEvent(el, 'mousedown').do(stopPropagation);
    const mousemove$ = Observable.fromEvent(document, 'mousemove').do(stopPropagation);
    const mouseup$ = Observable.fromEvent(document, 'mouseup').do(stopPropagation);

    return mousedown$.flatMap((e:MouseEvent) => {
      let startX = e.screenX;
      let startY = e.screenY;
      let start = Observable.of({type:'dragstart', dx:0, dy:0});
      let drag = mousemove$.map((e:MouseEvent) => {
        return {type:'drag', dx:e.screenX-startX, dy:e.screenY-startY};
      }).takeUntil(mouseup$);
      let end = mouseup$.first().map((e:MouseEvent) => {
        return {type:'dragend', dx:e.screenX-startX, dy:e.screenY-startY};
      });
      return start.merge(drag).merge(end) as Observable<CustomDragEvent>;
    });
  }
}
