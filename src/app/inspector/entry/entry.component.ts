import { Component, OnInit, Input } from '@angular/core';
import { Annotation } from '../../shared/models';

@Component({
  moduleId: module.id,
  selector: 'app-entry',
  templateUrl: 'entry.component.html',
  styleUrls: ['entry.component.css']
})
export class EntryComponent implements OnInit {

  title = 'inspectorentry works!';
  @Input() entry:Annotation;

  constructor() {

  }

  ngOnInit() {
  }

}
