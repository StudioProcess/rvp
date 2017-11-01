import {
  Component, AfterViewInit, Renderer2,
  ViewChild, ElementRef, Inject,
  ChangeDetectorRef, ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Observable} from 'rxjs/Observable'
import {Subscription} from 'rxjs/Subscription'
import 'rxjs/add/observable/fromEventPattern'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/publish'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar-container" [style.left.%]="containerLeft" [style.width.%]="containerWidth">
      <div class="handlebar">
        <div #left class="left-handle"><i class="ion-arrow-right-b"></i></div>
        <div class="content">{{caption}}</div>
        <div #right class="right-handle"><i class="ion-arrow-left-b"></i></div>
      </div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent implements AfterViewInit, OnDestroy {
  readonly caption = '|||'
  containerLeft = 0
  containerWidth = 100

  @ViewChild('left') leftHandle: ElementRef
  @ViewChild('right') rightHandle: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _host: ElementRef,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _renderer: Renderer2,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngAfterViewInit() {
    // TODO: add debounce
    const mousemove = this.fromEventPattern(this._renderer, this._document, 'mousemove')
    const mouseup = this.fromEventPattern(this._renderer, this._document, 'mouseup')

    const windowResize = this.fromEventPattern(this._renderer, window, 'resize')

    const hostRect = windowResize
      .map(() => {
        console.log('hostRect')
        return this._host.nativeElement.getBoundingClientRect()
      })
      .startWith(this._host.nativeElement.getBoundingClientRect())
      .publish()

    const leftMouseDown = this.fromEventPattern(this._renderer, this.leftHandle.nativeElement, 'mousedown')

    const clientPosWhileMouseMove = () => {
      return mousemove.map((mmEvent: MouseEvent) => {
        return {x: mmEvent.clientX, y: mmEvent.clientY}
      }).takeUntil(mouseup)
    }

    const leftClientPos = leftMouseDown.switchMap(clientPosWhileMouseMove)

    leftClientPos.map(({x}) => x).withLatestFrom(hostRect)
      .subscribe(([x, hRect]) => {
        const newLeft = Math.min(this.containerLeft+this.containerWidth-10, Math.max(0, (x-hRect.left)/hRect.width*100))
        const dL = this.containerLeft-newLeft
        this.containerLeft = newLeft;
        this.containerWidth += dL
        this._cdr.markForCheck()
      })

    const rightMouseDown = this.fromEventPattern(this._renderer, this.rightHandle.nativeElement, 'mousedown')

    const rightClientPos = rightMouseDown.switchMap(clientPosWhileMouseMove)

    rightClientPos.map(({x}) => x).withLatestFrom(hostRect)
      .subscribe(([x, hRect]) => {
        const w = (x-hRect.left)/(hRect.width)*100
        this.containerWidth = Math.min(100-this.containerLeft, Math.max(10, w-this.containerLeft))
        this._cdr.markForCheck()
      })

    this._subs.push(hostRect.connect())
  }

  fromEventPattern(renderer: Renderer2, elem: any, event: string) {
    let dereg: (()=>void)|null = null
    const addHandler = (handler: (event: any) => boolean|void) => {
      dereg = renderer.listen(elem, event, handler)
    }

    const noop = () => {}
    const removeHandler = () => dereg ? dereg() : noop()

    return Observable.fromEventPattern(addHandler, removeHandler)
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
