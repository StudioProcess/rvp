import { Injectable } from '@angular/core';
import { Annotation } from './models';
import { Observable, Subject } from 'rxjs/Rx';

@Injectable()
export class InspectorService {
  private _scrollToAnnotation: Subject<Annotation>;

  scrollToAnnotationStream:Observable<Annotation>;

  constructor() {
    this._scrollToAnnotation = new Subject<Annotation>();
    this.scrollToAnnotationStream = this._scrollToAnnotation.asObservable();
  }

  scrollToAnnotation(annotation: Annotation) {
    this._scrollToAnnotation.next(annotation);
  }
}
