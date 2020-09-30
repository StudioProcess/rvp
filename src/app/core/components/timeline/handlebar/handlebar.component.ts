import {
  Component, AfterViewInit,
  ViewChild, ElementRef, Inject,
  ChangeDetectionStrategy, OnInit,
  OnDestroy, Input, HostBinding,
  Output, ChangeDetectorRef, OnChanges,
  SimpleChanges, EventEmitter, HostListener
} from '@angular/core'

import { DOCUMENT } from '@angular/common'

import {
  Observable, ReplaySubject, Subject, Subscription,
  fromEvent, merge
} from 'rxjs'

import {
  filter, map, takeUntil, withLatestFrom,
  switchMap, distinctUntilChanged,
  distinctUntilKeyChanged
} from 'rxjs/operators'

import { Record } from 'immutable'

import {
  Annotation, PointerElement
} from '../../../../persistence/model'

import { _HANDLEBAR_MIN_WIDTH_ } from '../../../../config/timeline/handlebar'
import { DomService } from '../../../actions/dom.service'
import { PointerElementComponent } from '../../pointer-element/pointer-element.component'
import { Globals } from '../../../../common/globals'

type MoveTypes = 'noopMove' | 'leftMove' | 'middleMove' | 'rightMove'

export interface Handlebar {
  readonly left: number
  readonly width: number
  readonly source: 'intern' | 'extern'
  readonly move: MoveTypes
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar" (dblclick)="dblClick($event)">
      <div #leftHandle class="left-handle" [hidden]="viewmode_active"><i class="ion-md-arrow-dropright"></i></div>
      <div *ngIf="hasPointerElement" class="handlebarPointerMarker"></div>
      <div #middleHandle class="content">{{caption}}</div>
      <div #rightHandle class="right-handle" [hidden]="viewmode_active"><i class="ion-md-arrow-dropleft"></i></div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() readonly annotation: Record<Annotation>
  @Input() readonly trackIndex: number
  @Input() readonly trackIsVisible: boolean
  @Input() readonly hasPointerElement: boolean
  @Input() readonly playerCurrentTime: number
  @Input() readonly annotationStartTime: number
  @Input() readonly annotationEndTime: number
  @Input() readonly caption: string
  @Input() readonly containerRect: Observable<ClientRect>
  @Input() @HostBinding('class.selected') readonly isSelected = false
  @Input() @HostBinding('class.playercurrenttime') _isPlayerCurrentTime = false
  @Input() @HostBinding('style.opacity') readonly opacity: string = '1'
  @Input() @HostBinding('style.display') readonly display: string = 'block'
  @Input() @HostBinding('style.pointerEvents') readonly pointerEvents: string = 'auto'

  // Input left and width
  @Input('left') readonly inLeft: number
  @Input('width') readonly inWidth: number
  @Input('ommit_viewmode') readonly ommit_viewmode: boolean = false

  // Intern left and width (mutable, for fast UI updates)
  @HostBinding('style.left.%') internLeft: number
  @HostBinding('style.width.%') internWidth: number

  @ViewChild('leftHandle', { static: true }) private readonly _leftHandleRef: ElementRef
  @ViewChild('middleHandle', { static: true }) private readonly _middleHandleRef: ElementRef
  @ViewChild('rightHandle', { static: true }) private readonly _rightHandleRef: ElementRef

  @Output() readonly onHandlebarUpdate = new ReplaySubject<Handlebar>(1)
  @Output() readonly onDblClick = new EventEmitter()
  private readonly _syncValueSubj = new Subject<Handlebar>()
  private readonly _handlebarSubj = new ReplaySubject<Handlebar>(1)
  private readonly _video_elem_container = document.querySelector('.video-main-elem') as HTMLElement
  private readonly _subs: Subscription[] = []
  private _isDragging = false

  private isLeftBtn: any
  private mousemove: any
  private mouseup: any
  private leftMouseDown: any
  private rightMouseDown: any
  private middleMouseDown: any
  private clientPosWhileMouseMove: any
  private coordTransform: any
  private mapToPercentage: any
  private transformedToPercentage: any
  private leftClientPos: any
  private rightClientPos: any
  private middleClientPos: any
  private minMax: any
  private leftPos: any
  private rightPos: any
  private middlePos: any

  public viewmode_active: boolean = false
  public annotation_id: number


  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (this.annotation) {
      this._resetPointerTraits()
    }
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private _global: Globals,
    private readonly _domService: DomService,
    @Inject(DOCUMENT) private readonly _document: any) {
    // super(_domService)
  }

  ngOnInit() {
    const _initRect: Handlebar = {
      left: this.inLeft,
      width: this.inWidth,
      source: 'extern',
      move: 'noopMove'
    }

    // Init sync
    this.internLeft = this.inLeft
    this.internWidth = this.inWidth
    // Used intern
    this._handlebarSubj.next(_initRect)

    // No need to inform the outer world of the first handlebar update
    // since it's provided as @Input values
    this._subs.push(
      this._handlebarSubj.pipe(filter(hb => hb.source !== 'extern'))
        .subscribe(this.onHandlebarUpdate))

    if (this.annotation) {
      this._isPlayerCurrentTime = this.isPlayerCurrentTime()
      this.annotation_id = this.annotation.get('id', null) as number
    }
  }

  ngAfterViewInit() {

    this.isLeftBtn = (ev: MouseEvent) => ev.button === 0
    this.mousemove = fromEvent(this._document, 'mousemove')
    this.mouseup = fromEvent(this._document, 'mouseup')
    this.leftMouseDown = fromEvent(this._leftHandleRef.nativeElement, 'mousedown').pipe(filter(this.isLeftBtn))
    this.rightMouseDown = fromEvent(this._rightHandleRef.nativeElement, 'mousedown').pipe(filter(this.isLeftBtn))
    this.middleMouseDown = fromEvent(this._middleHandleRef.nativeElement, 'mousedown').pipe(filter(this.isLeftBtn))

    this.clientPosWhileMouseMove = (args: any) => {
      return this.mousemove.pipe(
        map((mmEvent: MouseEvent) => {
          const { clientX, clientY } = mmEvent
          return { clientX, clientY, payload: args }
        }),
        takeUntil(this.mouseup))
    }

    this.coordTransform = (clientX: number, hRect: ClientRect) => (clientX - hRect.left)
    this.mapToPercentage = (localX: number, hRect: ClientRect) => (localX / hRect.width * 100)
    this.transformedToPercentage = (clientX: number, hRect: ClientRect) => {
      return this.mapToPercentage(this.coordTransform(clientX, hRect), hRect)
    }

    this.leftClientPos = this.leftMouseDown.pipe(switchMap(this.clientPosWhileMouseMove))
    this.rightClientPos = this.rightMouseDown.pipe(switchMap(this.clientPosWhileMouseMove))
    this.middleClientPos = this.middleMouseDown.pipe(
      withLatestFrom(this._handlebarSubj, this.containerRect, (mdEvent: MouseEvent, prevHb: Handlebar, hRect: ClientRect) => {
        const m = this.transformedToPercentage(mdEvent.clientX, hRect)
        const hbRight = prevHb.left + prevHb.width
        return {
          distLeft: m - prevHb.left,
          distRight: hbRight - m,
          hRect
        }
      }),
      switchMap(this.clientPosWhileMouseMove))

    this.minMax = (x: number) => Math.min(Math.max(0, x), 100)

    this.leftPos = this.leftClientPos.pipe(
      map(({ clientX }) => clientX),
      withLatestFrom(this.containerRect, (clientX, hRect) => this.minMax(this.transformedToPercentage(clientX, hRect))),
      distinctUntilChanged(),
      withLatestFrom(this._handlebarSubj, (l: any, prevHb: any) => {
        const oldRight = prevHb.left + prevHb.width
        // ensure handlebar min width
        const newLeft = Math.min(l, oldRight - _HANDLEBAR_MIN_WIDTH_)
        const deltaLeft = newLeft - prevHb.left
        const newWidth = prevHb.width - deltaLeft
        return { left: newLeft, width: newWidth, move: 'leftMove' }
      }))

    this.rightPos = this.rightClientPos.pipe(
      map(({ clientX }) => clientX),
      withLatestFrom(this.containerRect, (clientX, hRect) => this.minMax(this.transformedToPercentage(clientX, hRect))),
      distinctUntilChanged(),
      withLatestFrom(this._handlebarSubj, (r:any, prevHb:any) => {
        const newRight = Math.max(prevHb.left + _HANDLEBAR_MIN_WIDTH_, r)
        return { left: prevHb.left, width: newRight - prevHb.left, move: 'rightMove' }
      }))

    this.middlePos = this.middleClientPos.pipe(
      map(({ clientX, payload: { distLeft, distRight, hRect } }) => {
        return {
          distLeft, distRight,
          m: this.minMax(this.transformedToPercentage(clientX, hRect))
        }
      }),
      distinctUntilKeyChanged('m'),
      withLatestFrom(this._handlebarSubj, ({ distLeft, m }, prevHb) => {
        const newLeft = Math.min(Math.max(0, m - distLeft), 100 - prevHb.width)
        return { left: newLeft, width: prevHb.width, move: 'middleMove' }
      }))


    this.subscribeSubs()

    this._global.getValue().subscribe((value) => {
      this.viewmode_active = value
      if (this.viewmode_active) {
        this._subs.forEach(sub => sub.unsubscribe())
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this._isDragging) {
      const hasLeftChanges = changes.inLeft
      const hasWidthChanges = changes.inWidth

      if (hasLeftChanges && hasWidthChanges) {
        const newLeft = changes.inLeft.currentValue
        const newWidth = changes.inWidth.currentValue
        this._syncValueSubj.next({ source: 'extern', left: newLeft, width: newWidth, move: 'noopMove' })
      } else if (hasLeftChanges) {
        const newLeft = changes.inLeft.currentValue
        this._syncValueSubj.next({ source: 'extern', left: newLeft, width: this.internWidth, move: 'noopMove' })
      } else if (hasWidthChanges) {
        const newWidth = changes.inWidth.currentValue
        this._syncValueSubj.next({ source: 'extern', left: this.internLeft, width: newWidth, move: 'noopMove' })
      }
    }

    if (this.annotation) {
      this._isPlayerCurrentTime = this.isPlayerCurrentTime()
      this._resetPointerTraits()
    }
  }

  dblClick(ev: MouseEvent) {
    ev.stopPropagation()
    this.onDblClick.emit()
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
    this._removePointer()
  }

  subscribeSubs() {
    this._subs.push(
      merge(this.leftMouseDown, this.rightMouseDown, this.middleMouseDown)
        .subscribe(() => {
          this._isDragging = true
        }))

    this._subs.push(this.mouseup.subscribe(() => {
      this._isDragging = false
    }))

    this._subs.push(
      merge(this.leftPos, this.middlePos, this.rightPos)
        .subscribe(({ left, width, move }: { left: number, width: number, move: MoveTypes }) => {
          this.internLeft = left
          this.internWidth = width
          this._handlebarSubj.next({ source: 'intern', left, width, move })
          this._cdr.markForCheck()
        }))

    this._subs.push(
      this._syncValueSubj
        .subscribe(({ left, width, move }) => {
          this.internLeft = left
          this.internWidth = width
          this._handlebarSubj.next({ source: 'extern', left, width, move })
          this._cdr.markForCheck()
        }))
  }

  isPlayerCurrentTime() {
    const annotationStartTime = parseFloat(this.annotationStartTime.toFixed(2))
    const annotationEndTime = parseFloat(this.annotationEndTime.toFixed(2))
    const playerCurrentTime = parseFloat(this.playerCurrentTime.toFixed(2))

    return ((playerCurrentTime >= annotationStartTime) && (playerCurrentTime <= annotationEndTime) ? true : false)
  }

  private _resetPointerTraits() {
    this._removePointer()
    this._setPointers()
  }

  private _removePointer() {
    let pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + this.annotation_id + '"]')
    if (pointer_elem !== null) {
      pointer_elem.remove()
    }
  }

  private _setPointers() {
    const entries_pointer_element = this.annotation.get('pointerElement', null)
    this._isPlayerCurrentTime = this.isPlayerCurrentTime()
    if (this._isPlayerCurrentTime) {
      // console.log(this.annotation)
      if (entries_pointer_element !== null && this.display === 'block') {
        if (!this._isPointerDisplayed(this.annotation_id)) {
          this._instantiatePointer(entries_pointer_element)
        }
      }
    } else {
      if (entries_pointer_element !== null && !this.isSelected) {
        if (this.annotation_id !== undefined && this._isPointerDisplayed(this.annotation_id)) {
          let pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + this.annotation_id + '"]')
          if (pointer_elem !== null) {
            pointer_elem.remove()
          }
        }
      }
    }
    if (this.isSelected) {
      this._addSelectedAnnotationPointerClass(this.annotation_id)
    } else {
      this._removeSelectedAnnotationPointerClass(this.annotation_id)
    }
  }

  private _isPointerDisplayed(annotation_id: number) {
    const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + annotation_id + '"]')
    return ((pointer_elem !== null) ? true : false)
  }

  private _instantiatePointer(options: any) {
    const componentRef = this._domService.instantiateComponent(PointerElementComponent)
    const componentRefInstance = this._domService.getInstance(componentRef)
    this._domService.attachComponent(componentRef, this._video_elem_container)

    if ((this._video_elem_container.offsetWidth !== options.video_width) || (this._video_elem_container.offsetHeight !== options.video_height)) {
      // reset widht/height ratio
      const ratio_width: number = (this._video_elem_container.offsetWidth / options.video_width).toFixed(2) as unknown as number
      const ratio_height: number = (this._video_elem_container.offsetHeight / options.video_height).toFixed(2) as unknown as number
      options.left = (options.left * ratio_width)
      options.top = (options.top * ratio_height)
      options.video_height = this._video_elem_container.offsetHeight
      options.video_width = this._video_elem_container.offsetWidth
    }

    componentRefInstance.setPointerTraits(<PointerElement>options)
  }

  private _removeSelectedAnnotationPointerClass(annotation_id: number) {
    if (this._isPointerDisplayed(this.annotation_id)) {
      const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + annotation_id + '"] .annotation-pointer-element')
      pointer_elem!.classList!.remove('annotation-selected')
    }
  }

  private _addSelectedAnnotationPointerClass(annotation_id: number) {
    let checkPointerInterval = setInterval(() => {
      if (this._isPointerDisplayed(this.annotation_id)) {
        const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + this.annotation_id + '"] .annotation-pointer-element')
        if (pointer_elem !== null) {
          pointer_elem!.classList!.add('annotation-selected')
        }
        clearInterval(checkPointerInterval)
      }
    }, 10)

  }
}
