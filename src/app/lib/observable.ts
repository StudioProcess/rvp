import {Renderer2} from '@angular/core'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/fromEventPattern'

import {noop} from './fp'

export function fromEventPattern(renderer: Renderer2, domElem: any, event: string) {
  let dereg: (()=>void)|null = null

  const addHandler = (handler: (event: any) => boolean|void) => {
    dereg = renderer.listen(domElem, event, handler)
  }

  const removeHandler = () => dereg ? dereg() : noop()

  return Observable.fromEventPattern(addHandler, removeHandler)
}
