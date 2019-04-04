import {
  Component,
  OnInit,
  //Output,
  //EventEmitter,
  HostBinding,
  //HostListener,
  //ViewEncapsulation
} from '@angular/core';

import {
  //CdkDragExit,
  CdkDragDrop
  //cdkDragDropped
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div
      cdkDrag
      cdkDragBoundary=".video-main-elem"
      (cdkDragStarted)="dragStarted($event)"
      (cdkDragReleased)="dragReleased($event)"
      (cdkDragEnded)="dragEnded($event)"
      [style.left.px]="calculatedX"
      class="annotation-pointer-element annotation-pointer-dot"
    >
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
    }
    .annotation-pointer-element {
      width: 20px;
      height: 20px;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      cursor: move;
    }
  `],
  //encapsulation: ViewEncapsulation.Native
})
export class PointerElementComponent implements OnInit {

  @HostBinding('style.left.px') left: number
  @HostBinding('style.top.px') top: number

  //@Output() dropped = new EventEmitter<CdkDragDrop<any>>()
  //@Output('cdkDragDropped') dropped: EventEmitter<CdkDragDrop<any>>
  //@HostListener('window:mouseup', ['$event']) mouseUp(event: any) {}

  constructor() { }

  ngOnInit() {
  }

  dragStarted(event: CdkDragDrop<string[]>) {
    //console.log('CdkDragStart', event);
  }
  dragEnded(event: CdkDragDrop<string[]>) {
    //console.log('CdkDragEnd', event);
  }
  dragReleased(event: CdkDragDrop<string[]>) {
    console.log('cdkDragReleased', event);
    let element = event.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);
    console.log('x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));
  }

  getPosition(el: any) {
    let x = 0;
    let y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }
}
