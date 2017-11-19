import {Routes} from '@angular/router'

import {MainContainer} from './core/components/main'
import {NotFoundComponent} from './core/components/notFound.component'

export const appRoutes: Routes = [
  {path: '', component: MainContainer, pathMatch: 'full'},
  {path: '**', component: NotFoundComponent}
]
