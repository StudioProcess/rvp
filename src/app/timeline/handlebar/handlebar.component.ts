import { Component, OnInit, Input, ElementRef, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

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

  @Output() centerDrag:Observable<MouseEvent>;
  @Output() leftDrag:Observable<MouseEvent>;
  @Output() rightDrag:Observable<MouseEvent>;

  constructor(private hostElement:ElementRef) { }

  ngOnInit() {
    let centerStreams = this.dragStreams('.handlebar');
    let leftStreams = this.dragStreams('.left-handle');
    let rightStreams = this.dragStreams('.right-handle');
    this.centerDrag = centerStreams.drag;
    this.leftDrag = leftStreams.drag;
    this.rightDrag = rightStreams.drag;

    // centerStreams.dragstart.subscribe((e) => { log.debug('center dragstart', e) });
    // centerStreams.drag.subscribe((e) => { log.debug('center drag', e) });
    // centerStreams.dragend.subscribe((e) => { log.debug('center dragend', e) });
    // leftStreams.dragstart.subscribe((e) => { log.debug('left dragstart', e) });
    // leftStreams.drag.subscribe((e) => { log.debug('left drag', e) });
    // leftStreams.dragend.subscribe((e) => { log.debug('left dragend', e) });
    // rightStreams.dragstart.subscribe((e) => { log.debug('right dragstart', e) });
    // rightStreams.drag.subscribe((e) => { log.debug('right drag', e) });
    // rightStreams.dragend.subscribe((e) => { log.debug('right dragend', e) });
  }

  private dragStreams(selector:string) {
    let stopPropagation = (e:MouseEvent) => { e.stopPropagation() };
    const el = this.hostElement.nativeElement.querySelector(selector);
    const down$ = Observable.fromEvent(el, 'mousedown').do(stopPropagation);
    const move$ = Observable.fromEvent(el, 'mousemove').do(stopPropagation);
    const up$ = Observable.fromEvent(el, 'mouseup').do(stopPropagation);
    let drag = down$.flatMap( () => move$.takeUntil(up$) ) as Observable<MouseEvent>;
    let dragstart = down$.flatMap( () => move$.first() ) as Observable<MouseEvent>;
    let dragend = dragstart.flatMap( () => up$.first() ) as Observable<MouseEvent>;
    return { drag, dragstart, dragend };
  }

}
