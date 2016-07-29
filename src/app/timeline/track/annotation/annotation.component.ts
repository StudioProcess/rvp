import { Component, OnInit, Input, Inject, forwardRef, HostBinding, ViewChild } from '@angular/core';
import { TimelineComponent } from '../../timeline.component';
import { Annotation, Timeline } from '../../../shared/models';
import { HandlebarComponent } from '../../handlebar/handlebar.component';
import { Store } from '@ngrx/store';
import { TimeService } from '../../../shared/time.service';

@Component({
  moduleId: module.id,
  selector: 'app-annotation',
  templateUrl: 'annotation.component.html',
  styleUrls: ['annotation.component.css'],
  directives: [HandlebarComponent]
})

export class AnnotationComponent implements OnInit {
  @ViewChild(HandlebarComponent) handlebar:HandlebarComponent;

  @Input() data:Annotation;
  @Input() backcolor:string;
  @Input() @HostBinding('class.selected') isSelected:boolean;

  timestamp:number;
  duration:number;

  constructor(
    @Inject(forwardRef(() => TimelineComponent)) private timeline,
    private store:Store<any>,
    private timeService:TimeService
  ) {}

  ngOnInit() {
    this.timestamp = this.data.utc_timestamp / this.timeline.data.duration * 100;
    if (this.data.duration == 0) {
      this.duration = 0.1;
    } else {
      this.duration = this.data.duration / this.timeline.data.duration * 100;
    }
    // log.debug('timeline duration', this.timeline.data.duration, 'annotation', this.timestamp, this.duration);

    // Select annotation on dragstart (= click)
    this.handlebar.drag.filter(e => e.type == 'dragstart').subscribe(e => {
      this.store.dispatch( { type: 'SELECT_ANNOTATION', payload: this.data } );
    });

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

}
