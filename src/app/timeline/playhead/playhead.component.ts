import { Component, OnInit, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-playhead',
  templateUrl: 'playhead.component.html',
  styleUrls: ['playhead.component.css']
})
export class PlayheadComponent implements OnInit {

  @Input() time:number = 0;

  constructor() {}

  ngOnInit() {
  }

}
