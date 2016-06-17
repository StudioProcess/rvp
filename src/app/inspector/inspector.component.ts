import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-inspector',
  templateUrl: 'inspector.component.html',
  styleUrls: ['inspector.component.css']
})
export class InspectorComponent implements OnInit {

  title = 'inspector works!';

  constructor() {}

  ngOnInit() {
  }

}
