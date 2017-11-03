import {
  Component, AfterViewInit, Renderer2,
  ViewChild, ElementRef, Inject,
  ChangeDetectorRef, ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/publish'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'

import {fromEventPattern} from '../../../../lib/observable'

import {_MIN_WIDTH_} from '../../../../config/timeline/handlebar'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar-container" [style.left.%]="containerLeft" [style.width.%]="containerWidth">
      <div class="handlebar">
        <div #leftHandle class="left-handle"><i class="ion-arrow-right-b"></i></div>
        <div class="content">{{caption}}</div>
        <div #rightHandle class="right-handle"><i class="ion-arrow-left-b"></i></div>
      </div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent implements AfterViewInit, OnDestroy {
  readonly caption = '|||'
  containerLeft = 0
  containerWidth = 100

  @ViewChild('leftHandle') leftHandle: ElementRef
  @ViewChild('rightHandle') rightHandle: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _host: ElementRef,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _renderer: Renderer2,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngAfterViewInit() {
    // TODO: add debounce
    const mousemove = fromEventPattern(this._renderer, this._document, 'mousemove')
    const mouseup = fromEventPattern(this._renderer, this._document, 'mouseup')
    const leftMouseDown = fromEventPattern(this._renderer, this.leftHandle.nativeElement, 'mousedown')
    const rightMouseDown = fromEventPattern(this._renderer, this.rightHandle.nativeElement, 'mousedown')
    const windowResize = fromEventPattern(this._renderer, window, 'resize')

    const hostRect = windowResize
      .map(() => this._host.nativeElement.getBoundingClientRect())
      .startWith(this._host.nativeElement.getBoundingClientRect())
      .do(() => console.log('HOST-RECT'))
      .publish()

    const clientPosWhileMouseMove = () => {
      return mousemove.map((mmEvent: MouseEvent) => {
        const {clientX, clientY} = mmEvent
        return {clientX, clientY}
      }).takeUntil(mouseup)
    }

    const leftClientPos = leftMouseDown.switchMap(clientPosWhileMouseMove)
    const rightClientPos = rightMouseDown.switchMap(clientPosWhileMouseMove)

    const coordTransform = (clientX: number, hRect: ClientRect) => (clientX-hRect.left)
    const mapToPercentage = (localX: number, hRect: ClientRect) => (localX/hRect.width*100)
    const transformedToPercentage = ([clientX, hRect]: [number, ClientRect]) => {
      return mapToPercentage(coordTransform(clientX, hRect), hRect)
    }

    const minMax = (x: number) => Math.min(100, Math.max(0, x))

    const left = leftClientPos.map(({clientX}) => clientX).withLatestFrom(hostRect)
      .map(transformedToPercentage).map(minMax)
      .distinctUntilChanged()
      .startWith(this.containerLeft)

    const right = rightClientPos.map(({clientX}) => clientX).withLatestFrom(hostRect)
      .map(transformedToPercentage).map(minMax)
      .distinctUntilChanged()
      .startWith(this.containerWidth)

    this._subs.push(left.subscribe(l => {
      const oldRight = this.containerLeft+this.containerWidth
      // ensure handlebar min width
      const newLeft = Math.min(l, oldRight-_MIN_WIDTH_)
      const deltaLeft = newLeft-this.containerLeft
      this.containerLeft = newLeft
      this.containerWidth = this.containerWidth-deltaLeft
      this._cdr.markForCheck()
    }))

    this._subs.push(right.subscribe(r => {
      // ensure handlebar min width
      const newRight = Math.max(this.containerLeft+_MIN_WIDTH_, r)
      this.containerWidth = newRight-this.containerLeft
      this._cdr.markForCheck()
    }))

    this._subs.push(hostRect.connect())
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
