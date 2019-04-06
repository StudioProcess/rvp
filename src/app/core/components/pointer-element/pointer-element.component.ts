import {
  Component,
  OnInit,
  ElementRef,
  HostBinding,
  //Output,
  //EventEmitter,
  //HostListener,
  //ViewEncapsulation
} from '@angular/core';

import {
  //CdkDragExit,
  //cdkDragDropped
  CdkDragDrop
} from '@angular/cdk/drag-drop';

import {
  PointerElement
} from '../../../persistence/model'

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div
      cdkDrag
      cdkDragBoundary=".video-main-elem"
      (cdkDragStarted)="dragStarted($event)"
      (cdkDragReleased)="dragReleased($event)"
      (cdkDragEnded)="dragEnded($event)"
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

  public active: boolean
  public initialPosition = {left: 0, top: 0}
  public position = {...this.initialPosition}
  public offset = {x: 0, y: 0}

  //@Output() dropped = new EventEmitter<CdkDragDrop<any>>()
  //@Output('cdkDragDropped') dropped: EventEmitter<CdkDragDrop<any>>
  //@HostListener('window:mouseup', ['$event']) mouseUp(event: any) {}

  constructor(private element: ElementRef) {
  }

  ngOnInit() {
  }

  setPointerTraits(options: PointerElement) {
    const elementHeight = this.element.nativeElement.offsetHeight
    const elementWidth = this.element.nativeElement.offsetWidth

    this.top = (options.top - (elementHeight / 2))
    this.left = (options.left - (elementWidth / 2))
    this.active = options.active
    this.position = options
    this.initialPosition = Object.assign({}, options)
  }
  dragStarted(event: CdkDragDrop<string[]>) {
    //console.log('CdkDragStart', event);
  }
  dragEnded(event: any) {
    this.offset = {...(<any>event.source._dragRef)._passiveTransform}
    this.position.left = this.initialPosition.left + this.offset.x
    this.position.top = this.initialPosition.top + this.offset.y

    /*console.log('CdkDragEnd', this.offset)
    console.log('initialPosition', this.initialPosition)*/
    console.log('position', this.position)
  }
  dragReleased(event: any) {
  }
  getPosition(el: any) {
    let x = 0;
    let y = 0;
    console.log('getPosition', el.scrollLeft, el.scrollTop)
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }
}
