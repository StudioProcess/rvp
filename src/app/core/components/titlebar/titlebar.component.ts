import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  //ChangeDetectionStrategy,
} from '@angular/core'

import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms'

import { Title } from '@angular/platform-browser'

import {
  Subscription,
  fromEvent,
} from 'rxjs'

import {
  _PROJECT_DEFAULT_TITLE_,
  _PROJECT_TITLE_MAX_LENGTH_
} from '../../../config/project'

import {
  ProjectGeneralData
} from '../../../persistence/model'

import { Store } from '@ngrx/store'
import { Record } from 'immutable'
import * as project from '../../../persistence/actions/project'
import * as fromProject from '../../../persistence/reducers'
import { Globals } from '../../../common/globals'


@Component({
  selector: 'rv-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlebarComponent implements OnInit {

  @Input() project_title: string
  @Input() project_initial_title: boolean
  @Input() readonly general: Record<ProjectGeneralData>
  @Input() readonly maxLength: 5

  @Output() readonly onTitleUpdate = new EventEmitter<project.UpdateProjectTitlePayload>()

  @ViewChild('projecttitle', { static: true }) private readonly _projecttitleInputRef: ElementRef

  pnform: FormGroup | null = null
  viewmode_active: boolean = false
  private readonly _subs: Subscription[] = []

  constructor(
    private readonly formBldr: FormBuilder,
    private readonly _store: Store<fromProject.State>,
    private titleService: Title,
    private global: Globals,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    this._store.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {
        const title = meta.getIn(['general', 'title'])! as string
        this.pnform!.controls['project_title'].setValue(title) //this.pnform!.patchValue({project_title: title})

        // set css class when default title
        this.project_initial_title = ((this.pnform!.value!.project_title! === _PROJECT_DEFAULT_TITLE_) ? true : false)
      }
    })
  }

  ngOnInit() {

    this.pnform = this.formBldr.group({
      project_title: [
        this.project_title,
        Validators.compose([
          Validators.required,
          Validators.maxLength(_PROJECT_TITLE_MAX_LENGTH_)
        ])
      ]
    })
  }

  ngAfterViewInit() {

    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
      this._cdr.detectChanges()
    })


    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
      if (!this.viewmode_active) {
        this.subscribeSubs()
      } else {
        this._subs.forEach(sub => sub.unsubscribe())
      }
    })

  }

  subscribeSubs () {
    this._subs.push(
      fromEvent(this._projecttitleInputRef.nativeElement, 'blur')
        .subscribe(
          ({ project_title }) => {
            let newTitle = this.pnform!.value!.project_title!
            if (newTitle === '') {
              newTitle = _PROJECT_DEFAULT_TITLE_
              this.pnform!.patchValue({ project_title: newTitle, viewmode: this.viewmode_active })
            }
            // reset document title
            this.titleService.setTitle(newTitle)

            this.onTitleUpdate.emit({
              title: newTitle
            })
          }))

    // prevent video play/pause (e.g hit space key)
    this._subs.push(
      fromEvent(this._projecttitleInputRef.nativeElement, 'keydown')
        .subscribe((ev: KeyboardEvent) => {
          ev!.stopPropagation()
        }))
  }
}
