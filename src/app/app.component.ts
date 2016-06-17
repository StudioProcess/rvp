import { Component } from '@angular/core';
import * as $ from 'jquery';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
  title = 'app works!';
  constructor() {
    // declare var document: any;
    console.log("app component");
    // console.log($());
    // declare var document:any;
    console.log(document);
  }
}
