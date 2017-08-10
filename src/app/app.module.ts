import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

/* Pipes */
import { TimePipe, UnixTimePipe } from './shared';

/* Directives */
import { KeyDirective } from './shared';

/* Services */
import { InspectorService, PlayerService, PlayheadService, TimelineService } from './shared';
import { SimpleBackendService, ProjectIOService } from './backend';

@NgModule({
  declarations: [
    AppComponent,
    TimePipe, UnixTimePipe,
    KeyDirective,
    InspectorService, PlayerService, PlayheadService, TimelineService,
    SimpleBackendService, ProjectIOService
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
