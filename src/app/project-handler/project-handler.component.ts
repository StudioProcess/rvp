import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-project-handler',
  templateUrl: 'project-handler.component.html',
  styleUrls: ['project-handler.component.scss']
})
export class ProjectHandlerComponent implements OnInit {

  @Output() projectReset = new EventEmitter<null>();
  @Output() projectExport = new EventEmitter<null>();

  @Output() projectImport = new EventEmitter<File>();
  @Output() videoFileOpened = new EventEmitter<File>();

  constructor() { }

  ngOnInit() { }

  resetButtonClicked(e: Event) {
    if(window.confirm("Reset the whole project? All data will be lost.")){
      this.projectReset.emit(null);
      this.closeModal();
    }
    e.preventDefault();
    // log.debug('reset button clicked');
  }

  exportButtonClicked(e: Event) {
    if(window.confirm("Export an archive of the project?")){
      this.projectExport.emit(null);
    }
    e.preventDefault();
    // log.debug('export button clicked');
  }

  importFileSelected(e: any) {
    let fileList = e.target.files;
    if (!fileList.length) return; // no file selected
    let file = fileList[0];
    this.projectImport.emit(file);
    this.closeModal();
    e.preventDefault();
    // log.debug('import file selected', file);
  }

  videoFileSelected(file: File) {
    this.videoFileOpened.emit(file);
    this.closeModal();
    // log.debug('video file selected', file);
  }

  // Close the settings modal window
  closeModal() {
    let modal = $('#settings-reveal') as any;
    modal.foundation('close');
  }

}
