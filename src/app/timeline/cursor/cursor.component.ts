import { Component, OnInit, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-cursor',
  templateUrl: 'cursor.component.html',
  styleUrls: ['cursor.component.css']
})
export class CursorComponent implements OnInit {

  @Input() time:number = 0;
  @Input() displayTime:number = 0;

  constructor() { }

  ngOnInit() {
  }

}
