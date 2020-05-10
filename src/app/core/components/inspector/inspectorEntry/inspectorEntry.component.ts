import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding, HostListener,
  ViewEncapsulation,
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
  private readonly _subs: Subscription[] = []
  private readonly _video_elem_container = document.querySelector('.video-main-elem') as HTMLElement

  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onFocusAnnotation = new EventEmitter<project.PlayerRequestCurrentTimePayload>()
  @Output() readonly onAddAnnotationPointer = new EventEmitter<project.UpdateAnnotationPointerPayload>()
  @Output() readonly onHashtagsUpdate = new EventEmitter<project.UpdateProjectHashtagsPayload>()

  @ViewChild('formWrapper', { static: true }) private readonly _formRef: ElementRef
  @ViewChild('start', { static: true }) private readonly _startInputRef: ElementRef
  @ViewChild('duration', { static: true }) private readonly _durationInputRef: ElementRef
  @ViewChild('descr', { static: true }) readonly _descrInputRef: ElementRef

  //private readonly _video_elem = document.querySelector('.video-main-elem video') as HTMLElement
  //private readonly domService = new domService()
  @HostListener('click', ['$event', '$event.target'])
  onClick(event: MouseEvent, target: HTMLElement) {
    this.removeHashTag(target)
  }

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    readonly _domService: DomService,
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
  }

  ngAfterViewInit() {

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
          currentTime: this.entry.get('annotation', null).get('utc_timestamp', null)
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
            fields: new AnnotationFieldsRecordFactory({ description })
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
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }

  pointerAction($event: MouseEvent) {
    //$event.preventDefault()
    //$event.stopPropagation()
    const annotation_id = this.entry.getIn(['annotation', 'id']) as number


    // console.log ('VIDEOELEM', this._video_elem_container)
    //console.log (componentRef, this._video_elem_container)
    //console.log ('componentRefInstance', componentRefInstance)

    const entries_pointer_element = this.entry.getIn(['annotation', 'pointerElement'])
    if (entries_pointer_element === null) {

      const componentRef = this._domService.instantiateComponent(PointerElementComponent)
      const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(componentRef, this._video_elem_container)

      // console.log('pointerAction', this._video_elem_container.offsetWidth, this._video_elem_container.offsetHeight)
      const componentWidth = componentRefInstance.element.nativeElement.querySelector('.annotation-pointer-element').offsetWidth
      const componentHeight = componentRefInstance.element.nativeElement.querySelector('.annotation-pointer-element').offsetHeight

      let options = {
        video_width: this._video_elem_container.offsetWidth,
        video_height: this._video_elem_container.offsetHeight,
        left: ((this._video_elem_container.offsetWidth / 2) - (componentWidth / 2)),
        top: ((this._video_elem_container.offsetHeight / 2) - (componentHeight / 2)),
        bgcolor: this.entry.get('color', null),
        active: true,
        zIndex: 1,
        trackIndex: this.entry.get('trackIndex', null),
        annotationStackIndex: this.entry.get('annotationStackIndex', null),
        annotationIndex: this.entry.get('annotationIndex', null),
        annotation_id: this.entry.getIn(['annotation', 'id']) as number,
      } as PointerElement

      componentRefInstance.setPointerTraits(<PointerElement>options)
      console.log('componentRefInstance.setPointerTraits', options, componentRef.instance, this.entry.getIn(['annotation', 'id']), this.entry.get('color', null))

      let path = {
        trackIndex: this.entry.get('trackIndex', null),
        annotationStackIndex: this.entry.get('annotationStackIndex', null),
        annotationIndex: this.entry.get('annotationIndex', null),
        annotation_id: this.entry.getIn(['annotation', 'id']) as number,
      }
      //console.log('Path', path)

      //componentRef.instance.left = options.left
      //componentRef.instance.top = options.top
      //componentRef.changeDetectorRef.detectChanges();
      let g = {
        annotation_id: this.entry.getIn(['annotation', 'id']) as number,
        pointerPayload: options,
        path: path
        //annotation: this.entry.get('annotation', null)
      }

      this.onAddAnnotationPointer.emit(g)
    } else {

      /**
       *  Check if pointer element for this ref already displayed
       */
      let pointer_already_displayed = false
      let all_pointer_refs = this._video_elem_container.querySelectorAll('rv-pointer-element') as PointerElementComponent
      all_pointer_refs.forEach((e) => {
        let pointer_id = e.getAttribute('pointer_id')
        if (pointer_id == annotation_id) {
          pointer_already_displayed = true
        }
      })

      if (!pointer_already_displayed) {
        const componentRef = this._domService.instantiateComponent(PointerElementComponent)
        const componentRefInstance = this._domService.getInstance(componentRef)
        this._domService.attachComponent(componentRef, this._video_elem_container)
        componentRefInstance.setPointerTraits(<PointerElement>entries_pointer_element)
      }
    }
  }

}
