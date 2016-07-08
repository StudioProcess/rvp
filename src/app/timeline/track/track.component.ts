import { Component, OnInit, Input } from '@angular/core';
import { AnnotationComponent } from './annotation';
import { Track, Annotation } from '../../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.css'],
  directives: [AnnotationComponent]
})
export class TrackComponent implements OnInit {

  @Input() data:Track;

  constructor() {
  }

  ngOnInit() {
  }

}
