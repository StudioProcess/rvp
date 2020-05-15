import {
  Component,
  OnInit,
  ElementRef,
  HostBinding,
  // Output,
  // EventEmitter,
  // HostListener,
  // ViewEncapsulation
} from '@angular/core'

import {
  CdkDragDrop
} from '@angular/cdk/drag-drop'

import { Store } from '@ngrx/store'
import * as project from '../../../persistence/actions/project'
import * as fromProject from '../../../persistence/reducers'

@Component({
  selector: 'rv-pointer-element',
  template: `
    <div
      cdkDrag
      cdkDragBoundary=".video-main-elem"
      (cdkDragStarted)="dragStarted($event)"
      (cdkDragReleased)="dragReleased($event)"
      (cdkDragEnded)="dragEnded($event)"
      (mousedown)="mousedown()"
      class="annotation-pointer-element annotation-pointer-dot"
    >
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      width: 0;
      height: 0;
      z-index: 1;
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

  // @Output() readonly updateAnnotationPointer = new EventEmitter<project.UpdateAnnotationPointerPayload>()

  @HostBinding('style.top.px') top: number
  @HostBinding('style.left.px') left: number
  @HostBinding('style.zIndex') zIndex: number
  @HostBinding('attr.pointer_id') pointer_id: number

  public active: boolean
  public offset: any
  public position: any // {...this.initialPosition}
  public initialPosition: any
  public width: number
  public height: number
  public bgcolor: string
  public options: any

  private readonly _video_elem_container = document.querySelector('.video-main-elem') as HTMLElement

  /*@HostListener('window:mouseup', ['$event']) mouseUp(event: any) {
    console.log('mouseup')
  }
  @HostListener('window:mousedown', ['$event']) onMouseDown(event: any) {
    console.log('mousedown')
  }*/


  constructor(
    private element: ElementRef,
    private readonly _store: Store<fromProject.State>
  ) {
    this.height = this.element.nativeElement.offsetHeight
    this.width = this.element.nativeElement.offsetWidth
    this.position = {}
  }

  ngOnInit() {
  }

  setPointerTraits(options: any /*PointerElement*/) {
    // console.log(options)
    this.pointer_id = options.annotation_path.annotation_id
    this.options = options
    this.top = options.top
    this.left = options.left
    this.active = options.active
    this.zIndex = options.zIndex
    this.position.top = options.top
    this.position.left = options.left
    this.initialPosition = { ...this.position }
    this.element.nativeElement.querySelector('.annotation-pointer-element').style.backgroundColor = options.bgcolor
  }

  dragStarted(event: CdkDragDrop<string[]>) {
  }

  dragEnded(event: any) {
    // console.log(event)
    this.getPosition(event)
    /*console.log('CdkDragEnd', this.offset)
    console.log('initialPosition', this.initialPosition)*/
    this.zIndex -= 10 // TODO :
    this.options.top = this.position.top
    this.options.left = this.position.left
    this.options.video_width = this._video_elem_container.offsetWidth
    this.options.video_height = this._video_elem_container.offsetHeight
    // console.log('position', this.position, this.options)

    let opts = this.options

    this._store.dispatch(new project.ProjectAnnotationAddPointer({
      annotation_id: this.options.annotation_path.annotation_id,
      pointer_payload: opts
    }))
  }

  dragReleased(event: any) {
  }

  mousedown() {
    this.zIndex += 10 // TODO :
  }

  getPosition(event: any) {
    this.offset = { ...(<any>event.source._dragRef)._passiveTransform }
    this.position.left = this.initialPosition.left + this.offset.x
    this.position.top = this.initialPosition.top + this.offset.y
  }

  resetPointerPosition(event: any) {
    /**
     * visually reset element to its origin
     */
    event.source.element.nativeElement.style.transform = 'none'
    const source: any = event.source
    /**
     * make it so new drag starts from same origin
     */
    source._passiveTransform = { x: 0, y: 0 }
  }
}
