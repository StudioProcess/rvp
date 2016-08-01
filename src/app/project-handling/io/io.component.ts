import { Component, OnInit, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-io',
  templateUrl: 'io.component.html',
  styleUrls: ['io.component.css']
})
export class IoComponent implements OnInit {

  @Input() videoSrc:string;

  constructor() { }

  ngOnInit() {
  }

}
