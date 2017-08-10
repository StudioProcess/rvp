import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/* Pipes */
import { TimePipe, UnixTimePipe } from './shared';

/* Directives */
import { KeyDirective } from './shared';

/* Services */
import { InspectorService, PlayerService, PlayheadService, TimelineService } from './shared';
import { SimpleBackendService, ProjectIOService } from './backend';

/* Components */
import { AppComponent } from './app.component';
import { VideoComponent } from './video';
import { ProjectHandlerComponent } from './project-handler';

@NgModule({
  declarations: [
    TimePipe, UnixTimePipe,
    KeyDirective,
    InspectorService, PlayerService, PlayheadService, TimelineService,
    SimpleBackendService, ProjectIOService,
    AppComponent,
    VideoComponent,
    ProjectHandlerComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
