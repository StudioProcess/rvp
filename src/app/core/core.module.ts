import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'

import {MainContainer} from './containers/main'
import {PlayerContainer} from './containers/player'

import {LoadingComponent} from './components/loading.component'
import {NotFoundComponent} from './components/not-found.component'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer,
  // Components
  LoadingComponent, NotFoundComponent
]

@NgModule({
  imports: [CommonModule],
  declarations: _DECLS_,
  exports: _DECLS_,
})
export class CoreModule {}
