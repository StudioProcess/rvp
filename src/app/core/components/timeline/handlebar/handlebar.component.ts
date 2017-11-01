import {
  Component, AfterViewInit, Renderer2,
  ViewChild, ElementRef, Inject
} from '@angular/core'

import {DOCUMENT} from '@angular/platform-browser'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/fromEventPattern'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'

@Component({
  selector: 'rv-handlebar',
  template: `
    <div class="handlebar-container">
      <div class="handlebar">
        <div #left class="left-handle"><i class="ion-arrow-right-b"></i></div>
        <div class="content">{{caption}}</div>
        <div #right class="right-handle"><i class="ixon-arrow-left-b"></i></div>
      </div>
    </div>
  `,
  styleUrls: ['handlebar.component.scss']
})
export class HandlebarComponent implements AfterViewInit {
  readonly caption = '|||'

  @ViewChild('left') leftHandle: ElementRef

  constructor(
    private readonly _renderer: Renderer2,
    @Inject(DOCUMENT) private readonly _document: any) {}

  ngAfterViewInit() {
    const mousedown = this.fromEventPattern(this._renderer, this.leftHandle.nativeElement, 'mousedown')
    const mousemove = this.fromEventPattern(this._renderer, this._document, 'mousemove')
    const mouseup = this.fromEventPattern(this._renderer, this._document, 'mouseup')

    const posWithStart = mousedown.switchMap((mdEvent: MouseEvent) => {
      const start = {
        startX: mdEvent.clientX,
        startY: mdEvent.clientY
      }

      return mousemove.map((mmEvent: MouseEvent) => {
        return {
          ...start,
          x: mmEvent.clientX,
          y: mmEvent.clientY
        }
      }).takeUntil(mouseup)
    })

    const deltaXY = posWithStart.map(({startX, startY, x, y}) => {
      return {dx: x - startX, dy: y - startY}
    })

    const deltaX = deltaXY.map(({dx}) => dx)

    deltaX.subscribe(dx => {
      console.log(`(${dx})`)
    })
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
}
