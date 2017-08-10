import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-playhead',
  templateUrl: 'playhead.component.html',
  styleUrls: ['playhead.component.scss']
})
export class PlayheadComponent implements OnInit {

  @Input() time:number = 0;
  @Input() displayTime:number = 0;

  constructor() {}

  ngOnInit() {
  }

}
