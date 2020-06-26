import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding, HostListener,
  ViewEncapsulation, ChangeDetectorRef
  // ChangeDetectorRef
} from '@angular/core'

import {
  FormGroup, FormBuilder, AbstractControl,
  Validators, ValidatorFn, ValidationErrors
} from '@angular/forms'

const _VALID_ = 'VALID' // not exported by @angular/forms

import { Record } from 'immutable'

import {
  Subscription, combineLatest,
  merge, fromEvent
} from 'rxjs'

import {
  withLatestFrom, map, filter,
  distinctUntilChanged, buffer,
  debounceTime,
  // tap, delay
} from 'rxjs/operators'

import { formatDuration } from '../../../../lib/time'

import {
  AnnotationColorMap, AnnotationRecordFactory,
  AnnotationFieldsRecordFactory, SelectionSource,
  AnnotationSelectionRecordFactory,
  PointerElement
} from '../../../../persistence/model'

import { _MOUSE_DBLCLICK_DEBOUNCE_ } from '../../../../config/form'

import * as project from '../../../../persistence/actions/project'
import { PointerElementComponent } from '../../pointer-element/pointer-element.component'
import { parseDuration } from '../../../../lib/time'
import { DomService } from '../../../actions/dom.service'
import { HashtagService } from '../../../actions/hashtag.service'
import { Globals } from '../../../../common/globals'

function durationValidatorFactory(): ValidatorFn {
  const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/

  return (control: AbstractControl): ValidationErrors | null => {
    const valid = durationRegex.test(control.value)
    return !valid ? { 'duration': { value: control.value } } : null
  }
}

const durationValidator = Validators.compose([Validators.required, durationValidatorFactory()])

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  host: { 'class': 'inspector-entry-host' },
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent extends HashtagService implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  form: FormGroup | null = null
  mouse_overed: boolean = false
  annotation_pointer_color: string = '#bbb'
  public annotation_id: number
  viewmode_active: boolean = false
  private readonly _subs: Subscription[] = []
  private readonly _video_elem_container = document.querySelector('.video-main-elem') as HTMLElement

  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() readonly playerCurrentTime: number
  @Input() readonly annotationStartTime: number
  @Input() readonly annotationEndTime: number
  @Input() @HostBinding('class.selected') readonly isSelected: boolean = false
  @Input() @HostBinding('class.playercurrenttime') _isPlayerCurrentTime: boolean = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onFocusAnnotation = new EventEmitter<project.PlayerRequestCurrentTimePayload>()
  @Output() readonly onAddAnnotationPointer = new EventEmitter<project.UpdateAnnotationPointerPayload>()
  @Output() readonly onHashtagsUpdate = new EventEmitter<project.UpdateProjectHashtagsPayload>()

  @ViewChild('formWrapper', { static: true }) private readonly _formRef: ElementRef
  @ViewChild('start', { static: true }) private readonly _startInputRef: ElementRef
  @ViewChild('duration', { static: true }) private readonly _durationInputRef: ElementRef
  @ViewChild('descr', { static: true }) readonly _descrInputRef: ElementRef

  @HostListener('click', ['$event', '$event.target'])
  onClick(event: MouseEvent, target: HTMLElement) {
    this.removeHashTag(target)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log(event.target.innerWidth)
    this._resetPointerTraits()
  }

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    readonly _domService: DomService,
    private global: Globals,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    super(_domService)
  }

  private _mapModel(entry: Record<AnnotationColorMap>) {
    const utc_timestamp = entry.getIn(['annotation', 'utc_timestamp'])
    const duration = entry.getIn(['annotation', 'duration'])
    const description = entry.getIn(['annotation', 'fields', 'description'])

    return {
      utc_timestamp: formatDuration(utc_timestamp),
      duration: formatDuration(duration),
      description
    }
  }

  ngOnInit() {

    const {
      utc_timestamp,
      duration,
      description
    } = this._mapModel(this.entry)

    this.form = this._fb.group({
      utc_timestamp: [utc_timestamp, durationValidator],
      duration: [duration, durationValidator],
      description
    })

    this.annotation_id = this.entry.getIn(['annotation', 'id']) as number
    this.annotation_pointer_color = ((this.entry.getIn(['annotation', 'pointerElement']) !== null) ? (this.entry.get('color', null) as string) : '#bbb')
  }

  ngAfterViewInit() {

    this.global.getValue().subscribe((value) => {
      this.viewmode_active = value
      this._cdr.detectChanges()
    })

    // add span nodes around hashtags inside textnodes
    this.encloseHashtags()

    // make sure all hashtags are filtered/saved
    this.saveHashtags(this.entry.getIn(['annotation', 'fields', 'description']))

    const formClick = fromEvent(this._formRef.nativeElement, 'click')
      .pipe(filter((ev: MouseEvent) => ev.button === 0))

    const formDblClick = formClick
      .pipe(
        buffer(formClick.pipe(debounceTime(_MOUSE_DBLCLICK_DEBOUNCE_))),
        map(clicksInBuffer => clicksInBuffer.length),
        filter(clicksInBuffer => clicksInBuffer === 2))

    const formKeyUp = fromEvent(this._descrInputRef.nativeElement, 'keyup')

    const durationKeydown = merge(
      fromEvent(this._startInputRef.nativeElement, 'keydown'),
      fromEvent(this._durationInputRef.nativeElement, 'keydown'))

    const formKeydown = merge(
      durationKeydown,
      fromEvent(this._descrInputRef.nativeElement, 'keydown'))

    const enterHotKey = formKeydown.pipe(filter((ev: KeyboardEvent) => ev.keyCode === 13))

    const formBlur = merge(
      fromEvent(this._startInputRef.nativeElement, 'blur'),
      fromEvent(this._durationInputRef.nativeElement, 'blur'),
      fromEvent(this._descrInputRef.nativeElement, 'blur'))

    // Select annotation
    this._subs.push(
      formClick.subscribe((ev: MouseEvent) => {
        this.onSelectAnnotation.emit({
          type: project.AnnotationSelectionType.Default,
          selection: AnnotationSelectionRecordFactory({
            track: this.entry.get('track', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotation: this.entry.get('annotation', null),
            source: SelectionSource.Inspector
          })
        })
        this.encloseHashtags({ 'replace': true })
      }))

    // Focus annotation
    this._subs.push(
      formDblClick.subscribe(() => {
        this.onFocusAnnotation.emit({
          // currentTime: this.entry.get('annotation', null).get('utc_timestamp', null)
          currentTime: (this.entry.getIn(['annotation', 'utc_timestamp']) + 0.1)
        })
      }))

    this._subs.push(
      formKeyUp.subscribe((ev: KeyboardEvent) => {
      }))

    this._subs.push(
      formKeydown.subscribe((ev: KeyboardEvent) => {
        ev.stopPropagation()
        if (this.isHashTagPopupContainerOpen) {
          this.handleHashtagInput(ev)
        } else {
          if (ev.keyCode === 191 || ev.key === '#') {
            this.handleHashTag(ev)
          }
        }
      }))

    const validDurationInputKey = (keyCode: number) => {
      return (keyCode >= 48 && keyCode <= 57) || // 0-9
        keyCode === 8 ||                         // backspace
        keyCode === 186 ||                       // :
        keyCode === 190 ||                       // .
        keyCode === 37 ||                        // left arrow
        keyCode === 39                           // right arrow
    }

    this._subs.push(
      durationKeydown.pipe(filter((ev: KeyboardEvent) => !validDurationInputKey(ev.keyCode)))
        .subscribe((ev: KeyboardEvent) => {
          ev.preventDefault()
        }))

    this._subs.push(
      enterHotKey.subscribe((ev: any) => {
        // if(ev.target.nodeName !== 'TEXTAREA') {
        if (ev.target.classList.contains('contenteditable') !== true) {
          ev.target.blur()
        }
      }))

    this._subs.push(
      formBlur
        .pipe(
          // delay(100),
          // tap((ev) => {}),
          withLatestFrom(combineLatest(this.form!.valueChanges, this.form!.statusChanges), (_, [form, status]) => {
            return [form, status]
          }),
          filter(([_, status]) => status === _VALID_),
          map(([form]) => form),
          distinctUntilChanged((prev, cur) => {
            return prev.title === cur.title && prev.description === cur.description &&
              prev.utc_timestamp === cur.utc_timestamp && prev.duration === cur.duration
          }))
        .subscribe(({ description, utc_timestamp, duration }) => {

          description = this.htmlBr(description)
          description = this.removeNodesFromText(description)
          this.saveHashtags(description)

          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp),
            duration: parseDuration(duration),
            fields: new AnnotationFieldsRecordFactory({ description }),
            pointerElement: this.entry.getIn(['annotation', 'pointerElement'])
          })

          this.onUpdate.emit({
            trackIndex: this.entry.get('trackIndex', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotationIndex: this.entry.get('annotationIndex', null),
            annotation
          })

          setTimeout(() => {
            this.encloseHashtags()
          }, 50)
        }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.form !== null && changes.entry !== undefined && !changes.entry.firstChange) {
      const { previousValue, currentValue } = changes.entry
      if (previousValue === undefined || !previousValue.equals(currentValue)) {
        // console.log(previousValue, currentValue)
        this.form.setValue(this._mapModel(currentValue))
      }
    }

    // this._setPointers()
    this._resetPointerTraits()
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }


  isPlayerCurrentTime() {
    // console.log(this.playerCurrentTime, this.annotationStartTime, this.annotationEndTime)
    return ((this.playerCurrentTime >= this.annotationStartTime) && (this.playerCurrentTime <= this.annotationEndTime) ? true : false)
  }

  pointerAction($event: MouseEvent) {

    this.onFocusAnnotation.emit({
      currentTime: (this.entry.getIn(['annotation', 'utc_timestamp']) + 0.1)
    })

    const annotation_id = this.entry.getIn(['annotation', 'id']) as number
    const entries_pointer_element = this.entry.getIn(['annotation', 'pointerElement'])
    /**
     *  check if new pointerelement
     */
    if (entries_pointer_element === null) {

      const componentWidth = 20
      const componentHeight = 20

      let options = {
        video_width: this._video_elem_container.offsetWidth as number,
        video_height: this._video_elem_container.offsetHeight as number,
        left: ((this._video_elem_container.offsetWidth / 2) - (componentWidth / 2)) as number,
        top: ((this._video_elem_container.offsetHeight / 2) - (componentHeight / 2)) as number,
        bgcolor: this.entry.get('color', null) as string,
        active: true as boolean,
        zIndex: 1 as number,
        annotation_path: {
          trackIndex: this.entry.get('trackIndex', null),
          annotationStackIndex: this.entry.get('annotationStackIndex', null),
          annotationIndex: this.entry.get('annotationIndex', null),
          annotation_id: annotation_id
        } as any
      } as PointerElement

      // this._instantiatePointer(<PointerElement>options)

      // save
      this.onAddAnnotationPointer.emit({
        annotation_id: annotation_id,
        pointer_payload: options
      })
    }
  }


  removePointerAction($event: MouseEvent) {
    this.onFocusAnnotation.emit({
      currentTime: (this.entry.getIn(['annotation', 'utc_timestamp']) + 0.1)
    })
    const annotation_id = this.entry.getIn(['annotation', 'id']) as number
    let options = {
      annotation_path: {
        trackIndex: this.entry.get('trackIndex', null),
        annotationStackIndex: this.entry.get('annotationStackIndex', null),
        annotationIndex: this.entry.get('annotationIndex', null),
        annotation_id: annotation_id
      } as any
    } as PointerElement
    this.onAddAnnotationPointer.emit({
      annotation_id: annotation_id,
      pointer_payload: options,
      remove: true
    })
    this._resetPointerTraits()
    this.annotation_pointer_color = '#bbb'
  }


  /**
   *  check if pointer to instantiate
   */
  private _setPointers() {
    const entries_pointer_element = this.entry.getIn(['annotation', 'pointerElement'])
    // console.log(entries_pointer_element)
    this._isPlayerCurrentTime = this.isPlayerCurrentTime()
    if (this._isPlayerCurrentTime) {
      if (entries_pointer_element !== null) {
        if (!this._isPointerDisplayed(this.annotation_id)) {
          this._instantiatePointer(<PointerElement>entries_pointer_element)
          this.annotation_pointer_color = this.entry.get('color', null) as string
        }
      }
    } else {
      if (entries_pointer_element !== null && !this.isSelected) {
        if (this.annotation_id !== undefined && this._isPointerDisplayed(this.annotation_id)) {
          let pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + this.annotation_id + '"]')
          if (pointer_elem !== null) {
            pointer_elem.remove()
            this.annotation_pointer_color = this.entry.get('color', null) as string
          }
        }
      } else if (this.isSelected) {
        /*
        if (entries_pointer_element !== null) {
          if (!this._isPointerDisplayed(this.annotation_id)) {
            this._instantiatePointer(<PointerElement>entries_pointer_element)
            this.annotation_pointer_color = this.entry.get('color', null) as string
          }
        }
        */
      }
    }
    if (this.isSelected) {
      this._addSelectedAnnotationPointerClass(this.annotation_id)
    } else {
      this._removeSelectedAnnotationPointerClass(this.annotation_id)
    }
  }

  private _resetPointerTraits() {
    // let pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + this.annotation_id + '"]')
    let pointer_elem = this._video_elem_container.querySelector('[pointer_id]')
    if (pointer_elem !== null) {
      pointer_elem.remove()
    }
    /*
    let all_pointer_refs = this._video_elem_container.querySelectorAll('rv-pointer-element')
    all_pointer_refs.forEach((e: any) => {
      e.remove()
    })
    */
    this._setPointers()
  }

  private _addSelectedAnnotationPointerClass(annotation_id: number) {
    setTimeout(() => {
      if (this._isPointerDisplayed(this.annotation_id)) {
        const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + annotation_id + '"] .annotation-pointer-element')
        pointer_elem!.classList.add('annotation-selected')
      }
    }, 0)
  }

  private _removeSelectedAnnotationPointerClass(annotation_id: number) {
    if (this._isPointerDisplayed(this.annotation_id)) {
      const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + annotation_id + '"] .annotation-pointer-element')
      pointer_elem!.classList.remove('annotation-selected')
    }
  }

  private _isPointerDisplayed(annotation_id: number) {
    const pointer_elem = this._video_elem_container.querySelector('[pointer_id="' + annotation_id + '"]')
    return ((pointer_elem !== null) ? true : false)
  }

  private _instantiatePointer(options: any) {
    const componentRef = this._domService.instantiateComponent(PointerElementComponent)
    const componentRefInstance = this._domService.getInstance(componentRef)
    this._domService.attachComponent(componentRef, this._video_elem_container)

    if ((this._video_elem_container.offsetWidth !== options.video_width) || (this._video_elem_container.offsetHeight !== options.video_height)) {
      // reset widht/height ratio
      const ratio_width: number = (this._video_elem_container.offsetWidth / options.video_width).toFixed(2) as unknown as number
      const ratio_height: number = (this._video_elem_container.offsetHeight / options.video_height).toFixed(2) as unknown as number
      options.left = (options.left * ratio_width)
      options.top = (options.top * ratio_height)
      options.video_height = this._video_elem_container.offsetHeight
      options.video_width = this._video_elem_container.offsetWidth

      // centered
      // const componentWidth = componentRefInstance.element.nativeElement.querySelector('.annotation-pointer-element').offsetWidth
      // const componentHeight = componentRefInstance.element.nativeElement.querySelector('.annotation-pointer-element').offsetHeight
      // options.left = ((this._video_elem_container.offsetWidth / 2) - (componentWidth / 2))
      // options.top = ((this._video_elem_container.offsetHeight / 2) - (componentHeight / 2))

      /*this.onAddAnnotationPointer.emit({
        annotation_id: this.entry.getIn(['annotation', 'id']) as number,
        pointer_payload: options
      })*/
    }

    componentRefInstance.setPointerTraits(<PointerElement>options)
  }

}
