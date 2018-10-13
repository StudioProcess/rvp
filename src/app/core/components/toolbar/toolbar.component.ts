import {
  Component, Input, OnInit,
  Output, ChangeDetectionStrategy,
  AfterViewInit, ViewChild,
  ElementRef, EventEmitter
} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'

import {fromEvent, Subscription} from 'rxjs'
import {debounceTime, pluck} from 'rxjs/operators'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'

import * as project from '../../../persistence/actions/project'
import {ImportVideoPayload} from '../../../persistence/actions/project'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  @Input('currentAnnotationsOnly') readonly currentAnnotationsOnlyIn: boolean
  @Input('search') readonly searchIn: string
  @Input('applyToTimeline') readonly applyToTimelineIn: boolean
  @Input() readonly hasSelectedAnnotations: boolean
  @Input() readonly hasClipboardAnnotations: boolean
  @Input() readonly hasRedo: boolean
  @Input() readonly hasUndo: boolean

  leftForm: FormGroup|null = null
  rightForm: FormGroup|null = null

  @Output() readonly onAddAnnotation = new EventEmitter()

  @Output() readonly onCurrentAnnotationsOnlyChange = new EventEmitter<boolean>()
  @Output() readonly onSearchChange = new EventEmitter<string>()
  @Output() readonly onApplyToTimelineChange = new EventEmitter<boolean>()

  @Output() readonly onImportProject = new EventEmitter()
  @Output() readonly onImportVideo = new EventEmitter<ImportVideoPayload>()
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()

  @ViewChild('search') private readonly _searchRef: ElementRef

  private readonly _subs: Subscription[] = []

  constructor(private readonly _fb: FormBuilder) {}

  private _mapLeftModel() {
    return {currentAnnotationsOnly: this.currentAnnotationsOnlyIn}
  }

  private _mapRightModel() {
    return {
      search: this.searchIn,
      applyToTimeline: this.applyToTimelineIn
    }
  }

  ngOnInit() {
    this.leftForm = this._fb.group(this._mapLeftModel())
    this.rightForm = this._fb.group(this._mapRightModel())

    this._subs.push(
      this.leftForm.valueChanges
      .pipe(
        pluck('currentAnnotationsOnly'))
      .subscribe((value: boolean) => {
        this.onCurrentAnnotationsOnlyChange.emit(value)
      }))

    this._subs.push(
      this.rightForm.valueChanges
      .pipe(
        pluck('search'), debounceTime(_FORM_INPUT_DEBOUNCE_))
      .subscribe((value: string) => {
        this.onSearchChange.emit(value)
      }))

    this._subs.push(
      this.rightForm.valueChanges
        .pipe(pluck('applyToTimeline'))
        .subscribe((value: boolean) => {
          this.onApplyToTimelineChange.emit(value)
        }))
  }

  ngAfterViewInit() {
    this._subs.push(fromEvent(this._searchRef.nativeElement, 'keydown').subscribe((ev: KeyboardEvent) => {
      ev.stopPropagation()
    }))
  }

  actionBtnClick($event: MouseEvent, btnId: string) {
    switch(btnId) {
      case 'add_annotation':
        this.onAddAnnotation.emit()
      break;
    }
  }

  importProject(projectFile: File) {
    this.onImportProject.emit(projectFile)
  }

  importVideo(videoImport: project.ImportVideoPayload) {
    this.onImportVideo.emit(videoImport)
  }

  exportProject() {
    this.onExportProject.emit()
  }

  resetProject() {
    this.onResetProject.emit()
  }

  clearSearch() {
    this.rightForm!.patchValue({search: null})
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
