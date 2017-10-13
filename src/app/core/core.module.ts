import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'

import {AppContainer} from './containers/app'
import {PlayerContainer} from './containers/player'

import {LoadingComponent} from './components/loading.component'
import {NotFoundComponent} from './components/notFound.component'

const _DECLS_ = [
  // Containers
  AppContainer, PlayerContainer,
  // Components
  LoadingComponent, NotFoundComponent
]

@NgModule({
  imports: [CommonModule],
  declarations: _DECLS_,
  exports: _DECLS_,
})
export class CoreModule {}
