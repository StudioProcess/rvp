import { Component, OnInit, Input, ElementRef, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

interface DragEvent {
  type:'dragstart'|'drag'|'dragend'
  event:MouseEvent;
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

  // define outputs
  @Output() centerDrag:Observable<DragEvent>;
  @Output() leftDrag:Observable<DragEvent>;
  @Output() rightDrag:Observable<DragEvent>;

  isCircle: boolean = false;

  constructor(private hostElement:ElementRef) {
    this.isCircle = false;
  }

  ngOnInit() {
    // publish drag event streams
    this.centerDrag = this.dragStream('.handlebar');
    this.leftDrag = this.dragStream('.left-handle');
    this.rightDrag = this.dragStream('.right-handle');

    // check if length shorter than minimum width
    if((this.width <= this.minWidth) && (this.width != 0)) {
      this.width = this.minWidth;
    }

    //check if width under minimum length
    if((this.width < 1) && (this.width != 0)) {
      this.width = 1;
      this.isCircle = true;
    }

    log.debug(this.width);

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
    const el = this.hostElement.nativeElement.querySelector(selector); // dom element with the given selector
    const mousedown$ = Observable.fromEvent(el, 'mousedown').do(stopPropagation);
    const mousemove$ = Observable.fromEvent(el, 'mousemove').do(stopPropagation);
    const mouseup$ = Observable.fromEvent(el, 'mouseup').do(stopPropagation);

    let drag = mousedown$.flatMap( () => mousemove$.skip(1).takeUntil(mouseup$) ).map( wrapEvent('drag') );
    let start = mousedown$.flatMap( () => mousemove$.first() ).map( wrapEvent('dragstart') );
    let end = start.flatMap( () => mouseup$.first() ).map( wrapEvent('dragend') );
    const up$ = Observable.fromEvent(el, 'mouseup');
    return drag.merge(start, end);
  }

}
