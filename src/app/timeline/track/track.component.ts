import { Component, OnInit, Input } from '@angular/core';
// import { AnnotationComponent } from './annotation';
import { Track, Annotation } from '../../shared/models';
import { Store } from '@ngrx/store';
import { TimelineService } from '../../shared';
// import { KeyDirective } from '../../shared/key.directive';s

@Component({
  selector: 'app-track',
  templateUrl: 'track.component.html',
  styleUrls: ['track.component.scss']
  // directives: [AnnotationComponent, KeyDirective]
})
export class TrackComponent implements OnInit {

  @Input() data:Track;

  constructor(private store:Store<any>, private timeService:TimelineService) {
  }

  ngOnInit() {
  }

  // add annotation
  doubleClick(e) {
    let clickPosition = e.offsetX + e.target.scrollLeft;
    let clickTime = this.timeService.convertPixelsToSeconds(clickPosition);

    let newAnnotation:Annotation = {
      utc_timestamp: clickTime,  // todo: calculate accurate time corresponding to relative position on track
      duration: 0,
      fields: {
        title: '',
        description: ''
      },
      isSelected: false
    };

    this.store.dispatch( { type: 'ADD_ANNOTATION', payload: { annotation: newAnnotation, track: this.data } } );
    this.store.dispatch( { type: 'SELECT_ANNOTATION', payload: newAnnotation } );
  }

  deleteTrack(){
    if(window.confirm("Really delete track? All annotations will be deleted, too.")){
      this.store.dispatch( { type: 'DELETE_TRACK', payload: { track: this.data } } );
    }
  }

  blurOnReturnKey(e) {
    if (e.keyCode == 13) { // Enter/Return or Numpad Return Key
      e.stopPropagation(); // prevent bubbling to e.g. timeInputGuard
      e.target.blur(); // emits blur event which triggers submit()
    }
  }

  setTitle(newTitle:string) {
    // log.debug('setting new title', newTitle);
    this.store.dispatch( { type: 'SET_TRACK_TITLE', payload: { title: newTitle, track: this.data } } );
  }
}
