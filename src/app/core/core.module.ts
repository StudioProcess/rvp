import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'

import {AppComponent} from './containers/app/app'

import {LoadingComponent} from './components/loading.component'

const _DECLS_ = [AppComponent, LoadingComponent]

@NgModule({
  imports: [CommonModule],
  declarations: _DECLS_,
  exports: _DECLS_
})
export class CoreModule {}
