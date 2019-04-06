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
  public offset: any
  public position: any // {...this.initialPosition}
  public initialPosition: any
  public width: number
  public height: number

  //@Output() dropped = new EventEmitter<CdkDragDrop<any>>()
  //@Output('cdkDragDropped') dropped: EventEmitter<CdkDragDrop<any>>
  //@HostListener('window:mouseup', ['$event']) mouseUp(event: any) {}

  constructor(private element: ElementRef) {
    this.height = this.element.nativeElement.offsetHeight
    this.width = this.element.nativeElement.offsetWidth
  }

  ngOnInit() {
  }

  setPointerTraits(options: PointerElement) {
    this.top = options.top
    this.left = options.left
    this.active = options.active
    this.position = options
    this.initialPosition = {...options}
  }
  dragStarted(event: CdkDragDrop<string[]>) {
    //console.log('CdkDragStart', event);
  }
  dragEnded(event: CdkDragDrop<string[]>) {
    this.getPosition(event)
    /*console.log('CdkDragEnd', this.offset)
    console.log('initialPosition', this.initialPosition)*/
    console.log('position', this.position)
  }
  dragReleased(event: any) {
  }
  getPosition(event: any) {
    this.offset = {...(<any>event.source._dragRef)._passiveTransform}
    this.position.left = this.initialPosition.left + this.offset.x
    this.position.top = this.initialPosition.top + this.offset.y
  }
}
