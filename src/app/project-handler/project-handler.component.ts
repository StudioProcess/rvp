import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FilepickerComponent } from './filepicker/filepicker.component';

@Component({
  moduleId: module.id,
  selector: 'app-project-handler',
  templateUrl: 'project-handler.component.html',
  styleUrls: ['project-handler.component.css'],
  directives: [ FilepickerComponent ]
})
export class ProjectHandlerComponent implements OnInit {

  @Output() projectReset = new EventEmitter<void>();
  @Output() projectExport = new EventEmitter<void>();

  @Output() projectImport = new EventEmitter<File>();
  @Output() videoFileOpened = new EventEmitter<File>();

  constructor() { }

  ngOnInit() { }

  resetButtonClicked(e) {
    this.projectReset.emit(null);
    e.preventDefault();
    // log.debug('reset button clicked');
  }

  exportButtonClicked(e) {
    this.projectExport.emit(null);
    e.preventDefault();
    // log.debug('export button clicked');
  }

  importFileSelected(e) {
    let fileList = e.target.files;
    if (!fileList.length) return; // no file selected
    let file = fileList[0];
    this.projectImport.emit(file);
    e.preventDefault();
    // log.debug('import file selected', file);
  }

  videoFileSelected(file: File) {
    this.videoFileOpened.emit(file);
    // log.debug('video file selected', file);
  }

}
