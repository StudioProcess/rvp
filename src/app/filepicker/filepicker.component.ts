import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-filepicker',
  templateUrl: 'filepicker.component.html',
  styleUrls: ['filepicker.component.css']
})
export class FilepickerComponent implements OnInit {

  @Output() filePicked = new EventEmitter();

  constructor() {}

  fileSelected(event) {
    event.preventDefault();
    let fileList = event.target.files;
    if (!fileList.length) return; // no file selected
    let file = fileList[0];
    // console.log('file selected', file);
    this.filePicked.emit({file});
  }

  // fileDropped(event) {
  //   event.preventDefault();
  //   console.log('file dropped', event);
  // }
  //
  // clicked(event) {
  //   console.log('file clicked', event);
  // }

  ngOnInit() {
  }

}
