import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

/* Pipes */
import { TimePipe, UnixTimePipe } from './shared';

/* Directives */
import { KeyDirective } from './shared';
import { ScrollZoom } from './timeline/';

/* Services */
import { InspectorService, PlayerService, PlayheadService, TimelineService } from './shared';
import { SimpleBackendService, ProjectIOService } from './backend';

/* Components */
import { AppComponent } from './app.component';
import { VideoComponent } from './video';
import { FilepickerComponent } from './project-handler/filepicker';
import { ProjectHandlerComponent } from './project-handler';
import { EntryComponent } from './inspector/entry';
import { InspectorComponent } from './inspector';
import { CursorComponent } from './timeline/cursor';
import { HandlebarComponent } from './timeline/handlebar';
import { PlayheadComponent } from './timeline/playhead';
import { AnnotationComponent } from './timeline/track/annotation';
import { TrackComponent } from './timeline/track';
import { TimelineComponent } from './timeline';

@NgModule({
  declarations: [
    TimePipe, UnixTimePipe,
    KeyDirective, ScrollZoom,
    
    AppComponent,
    VideoComponent,
    FilepickerComponent,
    ProjectHandlerComponent,
    EntryComponent,
    InspectorComponent,
    CursorComponent,
    HandlebarComponent,
    PlayheadComponent,
    AnnotationComponent,
    TrackComponent,
    TimelineComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule
  ],
  providers: [
    InspectorService, PlayerService, PlayheadService, TimelineService,
    SimpleBackendService, ProjectIOService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
