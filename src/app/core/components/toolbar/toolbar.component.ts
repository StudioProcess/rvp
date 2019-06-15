import {
  Component, Input, OnInit,
  Output, ChangeDetectionStrategy,
  AfterViewInit, ViewChild,
  ElementRef, EventEmitter,
  HostListener
} from '@angular/core'
import {FormBuilder, FormGroup} from '@angular/forms'

import {fromEvent, Subscription} from 'rxjs'
import {debounceTime, pluck} from 'rxjs/operators'

import {_FORM_INPUT_DEBOUNCE_} from '../../../config/form'


import * as project from '../../../persistence/actions/project'
import {ImportVideoPayload} from '../../../persistence/actions/project'
import {DomService} from '../../actions/dom.service'
import {HashtagService} from '../../actions/hashtag.service'

@Component({
  selector: 'rv-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent extends HashtagService implements OnInit, AfterViewInit {
  @Input('currentAnnotationsOnly') readonly currentAnnotationsOnlyIn: boolean
  @Input('search') readonly searchIn: string
  @Input('applyToTimeline') readonly applyToTimelineIn: boolean
  @Input() readonly hasSelectedAnnotations: boolean
  @Input() readonly hasClipboardAnnotations: boolean
  @Input() readonly hasRedo: boolean
  @Input() readonly hasUndo: boolean
  @Input() readonly hasTracks: boolean
  @Input() readonly hasActiveTrack: boolean

  leftForm: FormGroup|null = null
  rightForm: FormGroup|null = null

  @Output() readonly onAddAnnotation = new EventEmitter()
  @Output() readonly onDeleteAnnotation = new EventEmitter()
  @Output() readonly onCopyAnnotation = new EventEmitter()
  @Output() readonly onPasteAnnotation = new EventEmitter()
  @Output() readonly onUndoAction = new EventEmitter()
  @Output() readonly onRedoAction = new EventEmitter()

  @Output() readonly onCurrentAnnotationsOnlyChange = new EventEmitter<boolean>()
  @Output() readonly onSearchChange = new EventEmitter<string>()
  @Output() readonly onApplyToTimelineChange = new EventEmitter<boolean>()

  @Output() readonly onImportProject = new EventEmitter()
  @Output() readonly onImportVideo = new EventEmitter<ImportVideoPayload>()
  @Output() readonly onExportProject = new EventEmitter()
  @Output() readonly onExportProjectAsText = new EventEmitter()
  @Output() readonly onResetProject = new EventEmitter()
  @Output() readonly onNewProject = new EventEmitter()

  @ViewChild('search', { static: true }) readonly _searchRef: ElementRef

  @HostListener('click', ['$event', '$event.target'])
    onClick(event: MouseEvent, target: HTMLElement) {
      this.removeHashTag(target)
    }

  private readonly _subs: Subscription[] = []

  constructor(
    private readonly _fb: FormBuilder,
    readonly _domService: DomService
  ) {
    super(_domService)
  }

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
      if(ev.key == 'Enter') {
        ev.preventDefault()
      }
      if(this.isHashTagPopupContainerOpen) {
        this.handleHashtagInput(ev)
      } else {
        if(ev.keyCode === 191 || ev.key === '#') {
          this.handleHashTag(ev)
        }
      }
    }))
  }

  toolbarClick($event: MouseEvent) {
    $event.stopPropagation()
  }

  actionBtnClick($event: MouseEvent, btnId: string) {
    // $event.preventDefault()
    // $event.stopPropagation()
    switch(btnId) {
      case 'add_annotation':
        this.onAddAnnotation.emit()
      break
      case 'delete_annotation':
        this.onDeleteAnnotation.emit()
      break
      case 'copy_annotation':
        this.onCopyAnnotation.emit()
      break
      case 'paste_annotation':
        this.onPasteAnnotation.emit()
      break
      case 'undo_action':
        this.onUndoAction.emit()
      break
      case 'redo_action':
        this.onRedoAction.emit()
      break
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

  exportProjectAsText(type: string) {
    this.onExportProjectAsText.emit(type)
  }

  resetProject() {
    this.onResetProject.emit()
  }

  newProject() {
    this.onNewProject.emit()
  }

  clearSearch() {
    this.rightForm!.patchValue({search: null})
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }
}
