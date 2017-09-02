import { Component, OnInit, Input, Inject, forwardRef, HostBinding, ViewChild } from '@angular/core';
import { TimelineComponent } from '../..';
import { Annotation, Timeline } from '../../../shared/models';
import { HandlebarComponent } from '../../handlebar';
import { Store } from '@ngrx/store';
import { TimelineService, PlayerService, InspectorService } from '../../../shared';

@Component({
  selector: 'app-annotation',
  templateUrl: 'annotation.component.html',
  styleUrls: ['annotation.component.scss']
  // directives: [HandlebarComponent]
})

export class AnnotationComponent implements OnInit {
  @ViewChild(HandlebarComponent) handlebar:HandlebarComponent;

  @Input() data:Annotation;
  @Input() backcolor:string;
  @Input() @HostBinding('class.selected') isSelected:boolean;

  timestamp:number;
  duration:number;

  constructor(
    private store:Store<any>,
    private timeService:TimelineService,
    private playerService:PlayerService,
    private inspectorService:InspectorService
  ) {}

  ngOnInit() {
    this.timeService.timelineDurationStream.subscribe(timelineDuration => {
      this.timestamp = this.data.utc_timestamp / timelineDuration * 100;
      if (this.data.duration == 0) {
        this.duration = 0.1;
      } else {
        this.duration = this.data.duration / timelineDuration * 100;
      }
    });

    // log.debug('timeline duration', this.timeline.data.duration, 'annotation', this.timestamp, this.duration);

    // Update this annotation on dragend
    this.handlebar.drag.filter(e => e.type == 'dragend').subscribe(e => {
      // log.debug(e);
      let newAnnotation = Object.assign({}, this.data, {
        utc_timestamp: this.timeService.convertPercentToSeconds(e.left / 100),
        duration: this.timeService.convertPercentToSeconds(e.width / 100)
      });
      // log.debug(newAnnotation);
      this.store.dispatch({ type: 'UPDATE_ANNOTATION', payload: { old: this.data, new: newAnnotation } });
    });
  }

  // Select annotation (called on mousedown)
  select(e: MouseEvent) {
    this.store.dispatch( { type: 'SELECT_ANNOTATION', payload: this.data } );
    e.stopPropagation();
    this.inspectorService.scrollToAnnotation(this.data);
  }

  onDblclick(e: Event) {
    this.playerService.setTime(this.data.utc_timestamp);
    e.stopPropagation(); // Prevent this dblclick event from bubbling up
  }

}
