import { Component, OnInit, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-handlebar',
  templateUrl: 'handlebar.component.html',
  styleUrls: ['handlebar.component.css']
})
export class HandlebarComponent implements OnInit {

  // define inputs
  @Input() position:number;
  @Input() width:number;
  @Input() handlebarColor:string;
  @Input() text:string;

  constructor() { }

  ngOnInit() {
  }

  // export dragevent

  mouseDown($mouseDownEvent){
    log.debug("mouse down");
  }

}
