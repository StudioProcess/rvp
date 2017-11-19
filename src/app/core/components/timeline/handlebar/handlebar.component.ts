import {
  Component, AfterViewInit, Renderer2,
  ViewChild, ElementRef, Inject,
  ChangeDetectionStrategy, OnInit,
  OnDestroy, Input, HostBinding,
  ChangeDetectorRef, Output
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Observable} from 'rxjs/Observable'
import {ReplaySubject} from 'rxjs/ReplaySubject'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/distinctUntilKeyChanged'
import 'rxjs/add/operator/skip'

import {fromEventPattern} from '../../../../lib/observable'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'

export interface Handlebar {
  readonly payload: any
  readonly left: number
  readonly right: number
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
export class HandlebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() readonly caption: string
  @Input() readonly containerRect: Observable<ClientRect>
  @Input() readonly payload: any // Optional: attach some kind of payload
  @Input() @HostBinding('class.selected') readonly isSelected = false
  @Input('left') @HostBinding('style.left.%') readonly containerLeft: number
  @Input('width') @HostBinding('style.width.%') readonly containerWidth: number

  @ViewChild('leftHandle') readonly leftHandle: ElementRef
  @ViewChild('middleHandle') readonly middleHandle: ElementRef
  @ViewChild('rightHandle') readonly rightHandle: ElementRef

  private readonly handlebarSubj = new ReplaySubject<Handlebar>(1)
  @Output() readonly handlebar = new ReplaySubject<Handlebar>(1)

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _renderer: Renderer2,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngOnInit() {
    const _initRect: Handlebar = {
      payload: this.payload,
      left: this.containerLeft,
      right: this.containerLeft+this.containerWidth
    }

    this.handlebarSubj.next(_initRect)

    this._subs.push(
      this.handlebarSubj.skip(1).subscribe(this.handlebar))
  }

  ngAfterViewInit() {
    const mousemove = fromEventPattern(this._renderer, this._document, 'mousemove')
    const mouseup = fromEventPattern(this._renderer, this._document, 'mouseup')
    const leftMouseDown = fromEventPattern(this._renderer, this.leftHandle.nativeElement, 'mousedown')
    const rightMouseDown = fromEventPattern(this._renderer, this.rightHandle.nativeElement, 'mousedown')
    const middleMouseDown = fromEventPattern(this._renderer, this.middleHandle.nativeElement, 'mousedown')

    const clientPosWhileMouseMove = (args: any) => {
      return mousemove.map((mmEvent: MouseEvent) => {
        const {clientX, clientY} = mmEvent
        return {clientX, clientY, payload: args}
      }).takeUntil(mouseup)
    }

    const leftClientPos = leftMouseDown.switchMap(clientPosWhileMouseMove)
    const rightClientPos = rightMouseDown.switchMap(clientPosWhileMouseMove)
    const middleClientPos = middleMouseDown
      .withLatestFrom(this.handlebarSubj, this.containerRect, (mdEvent: MouseEvent, hbar: Handlebar, hRect: ClientRect) => {
        const m = transformedToPercentage(mdEvent.clientX, hRect)
        return {
          distLeft: m-hbar.left,
          distRight: hbar.right-m,
          hRect
        }
      })
      .switchMap(clientPosWhileMouseMove)

    const coordTransform = (clientX: number, hRect: ClientRect) => (clientX-hRect.left)
    const mapToPercentage = (localX: number, hRect: ClientRect) => (localX/hRect.width*100)
    const transformedToPercentage = (clientX: number, hRect: ClientRect) => {
      return mapToPercentage(coordTransform(clientX, hRect), hRect)
    }

    const minMax = (x: number) => Math.min(Math.max(0, x), 100)

    const left = leftClientPos.map(({clientX}) => clientX)
      .withLatestFrom(this.containerRect, (clientX, hRect) => minMax(transformedToPercentage(clientX, hRect)))
      .distinctUntilChanged()

    const right = rightClientPos.map(({clientX}) => clientX)
      .withLatestFrom(this.containerRect, (clientX, hRect) => minMax(transformedToPercentage(clientX, hRect)))
      .distinctUntilChanged()

    const middle = middleClientPos.map(({clientX, payload: {distLeft, distRight, hRect}}) => {
      return {
        distLeft, distRight,
        m: minMax(transformedToPercentage(clientX, hRect))
      }
    })
    .distinctUntilKeyChanged('m')

    this._subs.push(left.subscribe({
      next: l => {
        const oldRight = this.containerLeft+this.containerWidth
        // ensure handlebar min width
        const newLeft = Math.min(l, oldRight-_MIN_WIDTH_)
        const deltaLeft = newLeft-this.containerLeft
        const newWidth = this.containerWidth-deltaLeft

        this.handlebarSubj.next({
          payload: this.payload,
          left: newLeft,
          right: newLeft+newWidth
        })
        this._cdr.markForCheck()
      },
      error: err => this.handlebarSubj.error(err),
      complete: () => this.handlebarSubj.complete()
    }))

    this._subs.push(right.subscribe({
      next: r => {
        // ensure handlebar min width
        const newRight = Math.max(this.containerLeft+_MIN_WIDTH_, r)
        this.handlebarSubj.next({
          payload: this.payload,
          left: this.containerLeft,
          right: newRight
        })
        this._cdr.markForCheck()
      },
      error: err => this.handlebarSubj.error(err),
      complete: () => this.handlebarSubj.complete()
    }))

    this._subs.push(middle.subscribe({
      next: ({distLeft, m}) => {
        const newLeft = Math.min(Math.max(0, m-distLeft), 100-this.containerWidth)
        this.handlebarSubj.next({
          payload: this.payload,
          left: newLeft,
          right: newLeft+this.containerWidth
        })
        this._cdr.markForCheck()
      },
      error: err => this.handlebarSubj.error(err),
      complete: () => this.handlebarSubj.complete()
    }))
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
