import {
  Component, Input, Output,
  OnInit, OnChanges, AfterViewInit,
  EventEmitter, ViewChild, ElementRef,
  ChangeDetectionStrategy, OnDestroy,
  SimpleChanges, HostBinding, HostListener,
  ViewEncapsulation,
  //ChangeDetectorRef
} from '@angular/core'

import {
  FormGroup, FormBuilder, AbstractControl,
  Validators, ValidatorFn, ValidationErrors
} from '@angular/forms'

const _VALID_ = 'VALID' // not exported by @angular/forms

import {Record} from 'immutable'

import {
  Subscription, combineLatest,
  merge, fromEvent
} from 'rxjs'

import {
  withLatestFrom, map, filter,
  distinctUntilChanged, buffer,
  debounceTime
} from 'rxjs/operators'

import {formatDuration} from '../../../../lib/time'

import {
  AnnotationColorMap, AnnotationRecordFactory,
  AnnotationFieldsRecordFactory, SelectionSource,
  AnnotationSelectionRecordFactory
} from '../../../../persistence/model'

import {_MOUSE_DBLCLICK_DEBOUNCE_} from '../../../../config/form'

import * as project from '../../../../persistence/actions/project'
import {parseDuration} from '../../../../lib/time'
import {TaggingComponent} from '../../tagging/tagging.component'
import {DomService} from '../../../actions/dom.service'

function durationValidatorFactory(): ValidatorFn {
  const durationRegex = /^([0-9]*:){0,2}[0-9]*(\.[0-9]*)?$/

  return (control: AbstractControl): ValidationErrors|null => {
    const valid = durationRegex.test(control.value)
    return !valid ? {'duration': {value: control.value}} : null
  }
}

const durationValidator = Validators.compose([Validators.required, durationValidatorFactory()])

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: 'rv-inspector-entry',
  templateUrl: 'inspectorEntry.component.html',
  styleUrls: ['inspectorEntry.component.scss']
})
export class InspectorEntryComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input() readonly entry: Record<AnnotationColorMap>
  @Input() @HostBinding('class.selected') readonly isSelected = false

  @Output() readonly onUpdate = new EventEmitter<project.UpdateAnnotationPayload>()
  @Output() readonly onSelectAnnotation = new EventEmitter<project.SelectAnnotationPayload>()
  @Output() readonly onFocusAnnotation = new EventEmitter<project.PlayerRequestCurrentTimePayload>()

  @ViewChild('formWrapper') private readonly _formRef: ElementRef
  @ViewChild('start') private readonly _startInputRef: ElementRef
  @ViewChild('duration') private readonly _durationInputRef: ElementRef
  @ViewChild('descr') private readonly _descrInputRef: ElementRef

  @HostListener('click', ['$event', '$event.target'])
    onClick(event: MouseEvent, target: HTMLElement) {
      this.removeHashTag(target)
    }

  form: FormGroup|null = null
  isHashTagPopupContainerOpen: boolean = false

  private readonly _subs: Subscription[] = []

  // #Hashtags
  private readonly _tag_container_class = 'hashtag'
  private readonly _tag_container_close_class = 'hashtag-close'
  private readonly _tag_popup_container_id = 'tag-container'
  private _hashtagContainer: HTMLElement|null = null
  private _taggingComponentRef: any|null = null

  constructor(
    readonly elem: ElementRef,
    private readonly _fb: FormBuilder,
    private readonly _domService: DomService,
    //private readonly _changeDetector: ChangeDetectorRef
  ) {}

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

  ngAfterViewInit() {

    this.removeHashTagPopupContainer()

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
        if(this.isHashTagPopupContainerOpen) {
          this.handleHashtagInput(ev)
        } else {
          //console.log(ev)
          if(ev.keyCode === 191 || ev.key === '#') {
            this.addHashTag(ev)
          }
          //if(hashTagActionsInputKeys(ev.keyCode)) {}
        }
      }))

    /*const hashTagActionsInputKeys = (keyCode: number) => {
      return keyCode === 32
    }*/

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
        //if(ev.target.nodeName !== 'TEXTAREA') {
        if(ev.target.classList.contains('contenteditable') !== true) {
          ev.target.blur()
        }
      }))

    /*this._subs.push(
      formBlur
        .subscribe((ev: any) => {
          this.removeHashTagPopupContainer()
        }))*/

    this._subs.push(
      formBlur
        .pipe(
          withLatestFrom(combineLatest(this.form!.valueChanges, this.form!.statusChanges), (_, [form, status]) => {
            return [form, status]
          }),
          filter(([_, status]) => status === _VALID_),
          map(([form]) => form),
          distinctUntilChanged((prev, cur) => {
            return prev.title === cur.title && prev.description === cur.description &&
              prev.utc_timestamp === cur.utc_timestamp && prev.duration === cur.duration
          }))
        .subscribe(({description, utc_timestamp, duration}) => {

          //description = this.htmlBr(description)
          const annotation = new AnnotationRecordFactory({
            id: this.entry.getIn(['annotation', 'id']),
            utc_timestamp: parseDuration(utc_timestamp),
            duration: parseDuration(duration),
            fields: new AnnotationFieldsRecordFactory({description})
          })

          this.onUpdate.emit({
            trackIndex: this.entry.get('trackIndex', null),
            annotationStackIndex: this.entry.get('annotationStackIndex', null),
            annotationIndex: this.entry.get('annotationIndex', null),
            annotation
          })
        }))
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.form !== null && changes.entry !== undefined && !changes.entry.firstChange) {
      const {previousValue, currentValue} = changes.entry
      if(previousValue === undefined || !previousValue.equals(currentValue)) {
        this.form.setValue(this._mapModel(currentValue))
      }
    }
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe())
  }

  handleHashtagInput(ev: KeyboardEvent) {

    let selection = window.getSelection().anchorNode
    setTimeout(() => { // TODO : ugly hack, better find node another way (& read content via e.g. innerHTML)
      this._taggingComponentRef.instance.passed_hashtag = selection.textContent
    }, 10)

    //this._taggingComponentRef.instance.passed_hashtag_2 = selection.textContent
    //this._taggingComponentRef.instance._changeDetector.detectChanges()
    //this._taggingComponentRef.instance._changeDetector.markForCheck()
  }

  /*
  getCaretPosition() {
    if (window.getSelection && window.getSelection().getRangeAt) {
      var range = window.getSelection().getRangeAt(0);
      var selectedObj = window.getSelection();
      var rangeCount = 0;
      var childNodes = selectedObj.anchorNode.parentNode.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        if (childNodes[i] == selectedObj.anchorNode) {
          break;
        }
        if (childNodes[i].outerHTML)
          rangeCount += childNodes[i].outerHTML.length;
        else if (childNodes[i].nodeType == 3) {
          rangeCount += childNodes[i].textContent.length;
        }
      }
      //console.log(range.startOffset, selectedObj.anchorNode)
      return range.startOffset + rangeCount;
    }
    return -1;
  }
  */

  addHashTag(ev: any) {

    if(! this.isHashTagPopupContainerOpen) {
      //this.addHashTagContainer().then(value => {
      this.addHashTagPopupContainer()
      //this.addHashTagContainer()

      //let elem = ev.target as HTMLElement
      this._hashtagContainer = document.getElementById(this._tag_popup_container_id)! as HTMLElement

      //const componentRef = this._domService.instantiateComponent(TaggingComponent)
      this._taggingComponentRef = this._domService.instantiateComponent(TaggingComponent)
      // subscribe to tagging components onClickOutside event
      this._taggingComponentRef.instance.closeHashTagContainer.subscribe((ev: any) => {
        this.removeHashTagPopupContainer()
      })
      //this._taggingComponentRef.instance.passed_hashtag = 'tag'
      //const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(this._taggingComponentRef, this._hashtagContainer)

      this.isHashTagPopupContainerOpen = true

    }
  }

  removeHashTag(target: HTMLElement) {
    if(target.classList.contains(this._tag_container_close_class)) {
      const p = target.parentNode as HTMLElement
      if(p.classList.contains(this._tag_container_class)) {
        p.parentNode!.removeChild(p)
        this.isHashTagPopupContainerOpen = false
      }
    }
  }

  removeHashTagPopupContainer() {
    if(document.getElementById(this._tag_popup_container_id)) {
      let elem = document.getElementById(this._tag_popup_container_id)!
      //console.log('removeHashTagPopupContainer', elem)
      if (elem.parentNode) {
        let parent = elem.parentNode!
        //console.log('REMOVE', elem, parent)

        if(this._taggingComponentRef) {
          this._taggingComponentRef.destroy()
        }
        parent.removeChild(elem)

        this._hashtagContainer = null
        this.isHashTagPopupContainerOpen = false
      }
    }
  }

  addHashTagPopupContainer() {
    let range = document.getSelection()!.getRangeAt(0)!
    if(!range.collapsed) {
      range.deleteContents()
    }
    let hashtag_popup_container_span = document.createElement('span')
    hashtag_popup_container_span.id = this._tag_popup_container_id
    hashtag_popup_container_span.style.display = 'inline-block'
    hashtag_popup_container_span.contentEditable = 'false'

    range.insertNode(hashtag_popup_container_span)

    let sel = document.getSelection()!
    range = range!.cloneRange()
    range!.setStartAfter(hashtag_popup_container_span)
    range!.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    return true
  }

  addHashTagContainer() {

    /*
    let html = '<span class="'+this._tag_container_class+'">'
    html += '</span>'
    let range = document.getSelection().getRangeAt(0)
    let fragment = document.createRange().createContextualFragment(html)
    range.insertNode(fragment)
    */
    //return new Promise(resolve => {
    let range = document.getSelection()!.getRangeAt(0)!
    if(!range.collapsed) {
      range.deleteContents()
    }
    let hashtag_span = document.createElement('span')
    hashtag_span.className = this._tag_container_class
    hashtag_span.appendChild(document.createTextNode('#'))
    //hashtag_span.contentEditable = false
    //hashtag_span.style.display = 'inline-block'

    //let hashtag_span_text = document.createElement('span')
    //hashtag_span_text.className = 'hashtag-text'
    //hashtag_span_text.contentEditable = true

    // let hashtag_popup_container_span = document.createElement('span')
    // hashtag_popup_container_span.id = this._tag_popup_container_id
    // hashtag_popup_container_span.style.display = 'inline-block'
    //hashtag_popup_container_span.contentEditable = false

    //let hashtag_span_close = document.createElement('span')
    //hashtag_span_close.className = this._tag_container_close_class +' ion-ios-close-circle'
    //hashtag_span_close.style.display = 'inline-block'

    //hashtag_span.appendChild(document.createTextNode(''))
    //hashtag_span.appendChild(hashtag_popup_container_span)
    //hashtag_span.appendChild(hashtag_span_text)
    //hashtag_span_text.appendChild(document.createTextNode('#'))
    //hashtag_span.appendChild(hashtag_span_close)
    //hashtag_span.insertBefore(document.createTextNode('#'), hashtag_span_close)

    //console.log(hashtag_span)
    range.insertNode(hashtag_span)
    //range.surroundContents(hashtag_span)
    //range.insertNode(hashtag_popup_container_span)
    //range.insertNode(hashtag_span)


    // let sel = document.getSelection()
    // range.setStartBefore(hashtag_span.childNodes[0])
    // range.setEndAfter(hashtag_span.childNodes[0])
    // sel!.removeAllRanges()
    // sel!.addRange(range)

    let sel = document.getSelection()!
    range = range!.cloneRange()
    range!.setStartAfter(hashtag_span)
    range!.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    return true
      /*
      setTimeout(() => {
        resolve(true)
      }, 10)
    })*/
  }

  htmlBr(description: string) {
    const pat1 = new RegExp('<div>', 'g')
    const pat2 = new RegExp('</div>', 'g')
    return description.replace(pat1, '<br>').replace(pat2, '')
  }
}
