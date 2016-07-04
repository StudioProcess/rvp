import { Component, OnInit } from '@angular/core';
import { AnnotationComponent } from './annotation/annotation.component';

@Component({
  moduleId: module.id,
  selector: 'app-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.css'],
  directives: [AnnotationComponent]
})
export class TrackComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
