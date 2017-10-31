import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'

import {MainContainer} from './containers/main'
import {PlayerContainer} from './containers/player'
import {InspectorContainer} from './containers/inspector'
import {TimelineContainer} from './containers/timeline/timeline'

import {LoadingComponent} from './components/loading.component'
import {NotFoundComponent} from './components/notFound.component'
import {LogoComponent} from './components/logo.component'
import {MainNavComponent} from './components/mainNav.component'
import {ProjectBtnComponent} from './components/projectBtn/projectBtn.component'

// Inspector components
import {InspectorEntryComponent} from './components/inspector/inspectorEntry.component'

// Timeline components
import {TrackComponent} from './components/timeline/track/track.component'
import {HandlebarComponent} from './components/timeline/handlebar/handlebar.component'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer, InspectorContainer,
  TimelineContainer,
  // Components
  LoadingComponent, NotFoundComponent, LogoComponent,
  MainNavComponent, ProjectBtnComponent,
  // Inspector
  InspectorEntryComponent,
  // Timeline
  TrackComponent, HandlebarComponent
]

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: _DECLS_,
  exports: _DECLS_,
})
export class CoreModule {}
