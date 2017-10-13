import {Routes} from '@angular/router'

import {AppContainer} from './core/containers/app'
import {NotFoundComponent} from './core/components/notFound.component'

export const appRoutes: Routes = [
  {path: '', component: AppContainer},
  {path: '**', component: NotFoundComponent}
]
