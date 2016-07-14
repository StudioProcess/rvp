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

  @Output() centerDrag:Observable<any>;

  constructor(private hostElement:ElementRef) { }

  ngOnInit() {
    this.centerDrag = this.dragStream('.handlebar');
    // const left = el.querySelector('.left-handle');
    // const right = el.querySelector('.right-handle');
    // this.centerDrag.subscribe((e) => { log.debug(e) });
  }

  private dragStream(selector:string):Observable<MouseEvent> {
    const el = this.hostElement.nativeElement.querySelector(selector);
    log.debug(el);
    const down$ = Observable.fromEvent(el, 'mousedown');
    const move$ = Observable.fromEvent(el, 'mousemove');
    const up$ = Observable.fromEvent(el, 'mouseup');
    return down$.flatMap( () => move$.takeUntil(up$) ) as Observable<MouseEvent>;
  }

}
