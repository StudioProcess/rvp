import { Component, OnInit, Input } from '@angular/core';
import { AnnotationComponent } from './annotation';
import { Track, Annotation } from '../../shared/models';
import { Store } from '@ngrx/store';

@Component({
  moduleId: module.id,
  selector: 'app-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.css'],
  directives: [AnnotationComponent]
})
export class TrackComponent implements OnInit {

  @Input() data:Track;

  constructor(private store:Store<any>) {
  }

  ngOnInit() {
  }

  // add annotation
  doubleClick($clickEvent){
    let newAnnotation:Annotation = {
      utc_timestamp: 12,  // todo: calculate accurate time corresponding to relative position on track
      duration: 2,       // todo: calculate accurate duration corresponding to relative position on track
      fields: {
        title: '',
        description: ''
      }
    };
    this.store.dispatch( { type: 'ADD_ANNOTATION', payload: { annotation: newAnnotation, track: this.data }} );
    //     this.cursorTime = $moveEvent.offsetX / $moveEvent.currentTarget.offsetWidth * 100,100;
    log.debug($clickEvent.offsetX);// - $('timeline').offset().left);
  }

}
