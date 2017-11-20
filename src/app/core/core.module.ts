import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'

import {MainContainer} from './components/main/main'
import {PlayerContainer} from './components/player/player'
import {InspectorContainer} from './components/inspector/inspector'
import {TimelineContainer} from './components/timeline/timeline'

import {LoadingComponent} from './components/loading.component'
import {NotFoundComponent} from './components/notFound.component'
import {LogoComponent} from './components/logo.component'
import {ProjectBtnComponent} from './components/project/projectBtn/projectBtn.component'
import {ProjectModalComponent} from './components/project/projectModal/projectModal.component'
import {FooterComponent} from './components/footer/footer.component'

// Inspector components
import {InspectorEntryComponent} from './components/inspector/inspectorEntry/inspectorEntry.component'

// Timeline components
import {TrackComponent} from './components/timeline/track/track.component'
import {HandlebarComponent} from './components/timeline/handlebar/handlebar.component'
import {PlayheadComponent} from './components/timeline/playhead/playhead.component'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer, InspectorContainer,
  TimelineContainer,
  // Components
  LoadingComponent, NotFoundComponent, LogoComponent,
  ProjectBtnComponent, ProjectModalComponent, FooterComponent,
  // Inspector
  InspectorEntryComponent,
  // Timeline
  TrackComponent, HandlebarComponent, PlayheadComponent
]

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: _DECLS_,
  exports: _DECLS_,
})
export class CoreModule {}
