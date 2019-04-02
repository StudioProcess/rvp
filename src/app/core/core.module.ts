import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'

import {MainContainer} from './components/main/main'
import {PlayerContainer} from './components/player/player'
import {InspectorContainer} from './components/inspector/inspector'
import {TimelineContainer} from './components/timeline/timeline'

import {NotFoundComponent} from './components/notFound.component'
import {LogoComponent} from './components/logo.component'
import {ProjectBtnComponent} from './components/project/projectBtn/projectBtn.component'
import {ProjectModalComponent} from './components/project/projectModal/projectModal.component'
import {FooterComponent} from './components/footer/footer.component'
import {VersionComponent} from './components/version/version.component'
import {ToolbarComponent} from './components/toolbar/toolbar.component'
import {PointerElementComponent} from './components/pointer-element/pointer-element.component'

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
  NotFoundComponent, LogoComponent, VersionComponent,
  ProjectBtnComponent, ProjectModalComponent, FooterComponent,
  ToolbarComponent,
  PointerElementComponent,
  // Inspector
  InspectorEntryComponent,
  // Timeline
  TrackComponent, HandlebarComponent, PlayheadComponent
]

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  declarations: _DECLS_,
  exports: _DECLS_,
  entryComponents: [PointerElementComponent],
})
export class CoreModule {}
