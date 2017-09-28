import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'

import {AppComponent} from './containers/app/app'

import {LoadingComponent} from './components/loading.component'

// TODO: decide where to move this
import {VideoComponent} from '../video/video.component'
import {
  InspectorService, PlayerService,
  PlayheadService, TimelineService
} from '../shared'

const _DECLS_ = [AppComponent, LoadingComponent, VideoComponent]

@NgModule({
  imports: [CommonModule],
  declarations: _DECLS_,
  exports: _DECLS_,
  providers: [InspectorService, PlayerService, PlayheadService, TimelineService]
})
export class CoreModule {}
