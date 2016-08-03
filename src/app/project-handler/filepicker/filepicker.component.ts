import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-filepicker',
  templateUrl: 'filepicker.component.html',
  styleUrls: ['filepicker.component.css']
})
export class FilepickerComponent implements OnInit {

  @Output() filePicked = new EventEmitter<File>();

  constructor() { }

  ngOnInit() {
  }

  fileSelected(event) {
    event.preventDefault();
    let fileList = event.target.files;
    if (!fileList.length) return; // no file selected
    let file = fileList[0];
    this.filePicked.emit(file);
  }

}
