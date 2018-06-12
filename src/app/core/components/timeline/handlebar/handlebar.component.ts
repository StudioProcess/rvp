import {
  Component, AfterViewInit,
  ViewChild, ElementRef, Inject,
  ChangeDetectionStrategy, OnInit,
  OnDestroy, Input, HostBinding,
  Output, ChangeDetectorRef, OnChanges,
  SimpleChanges
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {
  Observable, ReplaySubject, Subject, Subscription,
  fromEvent, merge
} from 'rxjs'

import {
  filter, map, takeUntil, withLatestFrom,
  switchMap, distinctUntilChanged,
  distinctUntilKeyChanged
} from 'rxjs/operators'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'

export interface Handlebar {
  readonly left: number
  readonly width: number
  readonly source: 'intern' | 'extern'
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar">
      <div #leftHandle class="left-handle"><i class="ion-arrow-right-b"></i></div>
      <div #middleHandle class="content">{{caption}}</div>
      <div #rightHandle class="right-handle"><i class="ion-arrow-left-b"></i></div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() readonly caption: string
  @Input() readonly containerRect: Observable<ClientRect>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  // Input left and width
  @Input('left') readonly inLeft: number
  @Input('width') readonly inWidth: number

  // Intern left and width (mutable, for fast UI updates)
  @HostBinding('style.left.%') internLeft: number
  @HostBinding('style.width.%') internWidth: number

  @ViewChild('leftHandle') private readonly leftHandleRef: ElementRef
  @ViewChild('middleHandle') private readonly middleHandleRef: ElementRef
  @ViewChild('rightHandle') private readonly rightHandleRef: ElementRef

  private readonly syncValueSubj = new Subject<Handlebar>()
  private readonly handlebarSubj = new ReplaySubject<Handlebar>(1)
  @Output() readonly onHandlebarUpdate = new ReplaySubject<Handlebar>(1)

  private readonly _subs: Subscription[] = []

  private isDragging = false

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngOnInit() {
    const _initRect: Handlebar = {
      left: this.inLeft,
      width: this.inWidth,
      source: 'extern'
    }

    // Init sync
    this.internLeft = this.inLeft
    this.internWidth = this.inWidth
    // Used intern
    this.handlebarSubj.next(_initRect)

    // No need to inform the outer world of the first handlebar update
    // since it's provided as @Input values
    this._subs.push(
      this.handlebarSubj.pipe(filter(hb => hb.source !== 'extern'))
        .subscribe(this.onHandlebarUpdate))
  }

  ngAfterViewInit() {
    const isLeftBtn = (ev: MouseEvent) => ev.button === 0

    const mousemove = fromEvent(this._document, 'mousemove')
    const mouseup = fromEvent(this._document, 'mouseup')
    const leftMouseDown = fromEvent(this.leftHandleRef.nativeElement, 'mousedown').pipe(filter(isLeftBtn))
    const rightMouseDown = fromEvent(this.rightHandleRef.nativeElement, 'mousedown').pipe(filter(isLeftBtn))
    const middleMouseDown = fromEvent(this.middleHandleRef.nativeElement, 'mousedown').pipe(filter(isLeftBtn))

    const clientPosWhileMouseMove = (args: any) => {
      return mousemove.pipe(
        map((mmEvent: MouseEvent) => {
          const {clientX, clientY} = mmEvent
          return {clientX, clientY, payload: args}
        }),
        takeUntil(mouseup))
    }

    const coordTransform = (clientX: number, hRect: ClientRect) => (clientX-hRect.left)
    const mapToPercentage = (localX: number, hRect: ClientRect) => (localX/hRect.width*100)
    const transformedToPercentage = (clientX: number, hRect: ClientRect) => {
      return mapToPercentage(coordTransform(clientX, hRect), hRect)
    }

    const leftClientPos = leftMouseDown.pipe(switchMap(clientPosWhileMouseMove))
    const rightClientPos = rightMouseDown.pipe(switchMap(clientPosWhileMouseMove))
    const middleClientPos = middleMouseDown.pipe(
      withLatestFrom(this.handlebarSubj, this.containerRect, (mdEvent: MouseEvent, prevHb: Handlebar, hRect: ClientRect) => {
        const m = transformedToPercentage(mdEvent.clientX, hRect)
        const hbRight = prevHb.left+prevHb.width
        return {
          distLeft: m-prevHb.left,
          distRight: hbRight-m,
          hRect
        }
      }),
      switchMap(clientPosWhileMouseMove))

    const minMax = (x: number) => Math.min(Math.max(0, x), 100)

    const leftPos = leftClientPos.pipe(
      map(({clientX}) => clientX),
      withLatestFrom(this.containerRect, (clientX, hRect) => minMax(transformedToPercentage(clientX, hRect))),
      distinctUntilChanged(),
      withLatestFrom(this.handlebarSubj, (l, prevHb) => {
        const oldRight = prevHb.left+prevHb.width
        // ensure handlebar min width
        const newLeft = Math.min(l, oldRight-_MIN_WIDTH_)
        const deltaLeft = newLeft-prevHb.left
        const newWidth = prevHb.width-deltaLeft
        return {left: newLeft, width: newWidth}
      }))

    const rightPos = rightClientPos.pipe(
      map(({clientX}) => clientX),
      withLatestFrom(this.containerRect, (clientX, hRect) => minMax(transformedToPercentage(clientX, hRect))),
      distinctUntilChanged(),
      withLatestFrom(this.handlebarSubj, (r, prevHb) => {
        const newRight = Math.max(prevHb.left+_MIN_WIDTH_, r)
        return {left: prevHb.left, width: newRight-prevHb.left}
      }))

    const middlePos = middleClientPos.pipe(
      map(({clientX, payload: {distLeft, distRight, hRect}}) => {
        return {
          distLeft, distRight,
          m: minMax(transformedToPercentage(clientX, hRect))
        }
      }),
      distinctUntilKeyChanged('m'),
      withLatestFrom(this.handlebarSubj, ({distLeft, m}, prevHb) => {
        const newLeft = Math.min(Math.max(0, m-distLeft), 100-prevHb.width)
        return {left: newLeft, width: prevHb.width}
      }))

    this._subs.push(
      merge(leftMouseDown, rightMouseDown, middleMouseDown)
        .subscribe(() => {
          this.isDragging = true
        }))

    this._subs.push(mouseup.subscribe(() => {
      this.isDragging = false
    }))

    this._subs.push(
      merge(leftPos, middlePos, rightPos)
        .subscribe(({left, width}) => {
          this.internLeft = left
          this.internWidth = width
          this.handlebarSubj.next({source: 'intern', left, width})
          this._cdr.markForCheck()
        }))

    this._subs.push(
      this.syncValueSubj
        .subscribe(({left, width}) => {
          this.internLeft = left
          this.internWidth = width
          this.handlebarSubj.next({source: 'extern', left, width})
          this._cdr.markForCheck()
        }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.isDragging) {
      const hasLeftChanges = changes.inLeft
      const hasWidthChanges = changes.inWidth

      if(hasLeftChanges && hasWidthChanges) {
        const newLeft = changes.inLeft.currentValue
        const newWidth = changes.inWidth.currentValue
        this.syncValueSubj.next({source: 'extern', left: newLeft, width: newWidth})
      } else if(hasLeftChanges) {
        const newLeft = changes.inLeft.currentValue
        this.syncValueSubj.next({source: 'extern', left: newLeft, width: this.internWidth})
      } else if(hasWidthChanges) {
        const newWidth = changes.inWidth.currentValue
        this.syncValueSubj.next({source: 'extern', left: this.internLeft, width: newWidth})
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
