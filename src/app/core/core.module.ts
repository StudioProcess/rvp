import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ContenteditableModule } from '@ng-stack/contenteditable'
import { AutoSizeInputModule } from 'ngx-autosize-input';

import { MainContainer } from './components/main/main'
import { PlayerContainer } from './components/player/player'
import { InspectorContainer } from './components/inspector/inspector'
import { TimelineContainer } from './components/timeline/timeline'

import { NotFoundComponent } from './components/notFound.component'
import { LogoComponent } from './components/logo.component'
import { ProjectBtnComponent } from './components/project/projectBtn/projectBtn.component'
import { ProjectModalComponent } from './components/project/projectModal/projectModal.component'
import { FooterComponent } from './components/footer/footer.component'
import { VersionComponent } from './components/version/version.component'
import { ToolbarComponent } from './components/toolbar/toolbar.component'
import { PointerElementComponent } from './components/pointer-element/pointer-element.component'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { ProgressModalComponent } from './components/project/progress-modal/progress-modal.component'
import { TitlebarComponent } from './components/titlebar/titlebar.component'
import { TaggingComponent } from './components/tagging/tagging.component'
import { TagAddModalComponent } from './components/tagging/tag-add-modal/tag-add-modal.component'

// Inspector components
import { InspectorEntryComponent } from './components/inspector/inspectorEntry/inspectorEntry.component'

// Timeline components
import { TrackComponent } from './components/timeline/track/track.component'
import { HandlebarComponent } from './components/timeline/handlebar/handlebar.component'
import { PlayheadComponent } from './components/timeline/playhead/playhead.component'

//import {DomService} from './actions/dom.service'

const _DECLS_ = [
  // Containers
  MainContainer, PlayerContainer, InspectorContainer,
  TimelineContainer,
  // Components
  NotFoundComponent, LogoComponent, VersionComponent,
  ProjectBtnComponent, ProjectModalComponent, FooterComponent,
  PointerElementComponent,
  ToolbarComponent, ProgressModalComponent, TitlebarComponent,
  // Inspector
  InspectorEntryComponent,
  // Timeline
  TrackComponent, HandlebarComponent, PlayheadComponent,
  // Tagging
  TaggingComponent, TagAddModalComponent
]

@NgModule({
  //providers: [DomService]
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ContenteditableModule,
    AutoSizeInputModule,
    DragDropModule
  ],
  declarations: _DECLS_,
  exports: _DECLS_,
  entryComponents: [PointerElementComponent, TaggingComponent, TagAddModalComponent],
})
export class CoreModule { }
