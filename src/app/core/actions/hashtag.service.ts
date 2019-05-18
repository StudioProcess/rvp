import {
  //Injectable,
  //ViewChild,
  //ElementRef,
} from '@angular/core'

import {DomService} from './dom.service'
import {TaggingComponent} from '../components/tagging/tagging.component'

/*@Injectable({
  providedIn: 'root',
})*/
export class HashtagService {

  // Placeholders
  onHashtagsUpdate: any
  _descrInputRef: any
  _searchRef: any
  rightForm: any
  form: any

  // #Hashtags
  readonly tagContainerClass = 'hashtag'
  readonly tagContainerCloseClass = 'hashtag-close'
  readonly tagPopupContainerId = 'tag-container'
  hashtagContainer: HTMLElement|null = null
  taggingComponentRef: any|null = null
  isHashTagPopupContainerOpen: boolean = false

  constructor(
    readonly _domService: DomService,
  ) {}

  addHashTag(ev: KeyboardEvent) {
    if(! this.isHashTagPopupContainerOpen) {
      // container for the hashtag popup component
      this.addHashTagPopupContainer()

      //let elem = ev.target as HTMLElement
      this.hashtagContainer = document.getElementById(this.tagPopupContainerId)! as HTMLElement

      //const componentRef = this._domService.instantiateComponent(TaggingComponent)
      this.taggingComponentRef = this._domService.instantiateComponent(TaggingComponent)

      // subscribe to tagging components onClickOutside event
      this.taggingComponentRef.instance.closeHashTagContainer.subscribe((ev: any) => {
        this.removeHashTagPopupContainer()
      })

      this.taggingComponentRef.instance.passHashTagToContent.subscribe((data: any) => {
        //console.log(data, this._descrInputRef)
        this.swapHashtag(data)
      })

      this.taggingComponentRef.instance.passed_hashtag = '#'
      //const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(this.taggingComponentRef, this.hashtagContainer)

      this.isHashTagPopupContainerOpen = true
    }
  }

  saveHashtags(description: string) {
    const hashtags = description.match(/#\w+/g)
    this.onHashtagsUpdate.emit({
      hashtags
    })
  }

  /**
   *  add a node within contenteditable container (left of the hashtag textnode before caret)
   *  which is used as the container (mainly positioning) of the tagging
   *  popup component (will be removed on any formblur, save, pick etc. event).
   */
  addHashTagPopupContainer() {
    let range = document.getSelection()!.getRangeAt(0)!
    if(!range.collapsed) {
      range.deleteContents()
    }
    //console.log(range)
    let hashtag_popup_container_span = document.createElement('span')
    hashtag_popup_container_span.id = this.tagPopupContainerId
    hashtag_popup_container_span.style.display = 'inline-block'
    hashtag_popup_container_span.contentEditable = 'false'

    range.insertNode(hashtag_popup_container_span)

    let sel = document.getSelection()!
    range = range!.cloneRange()
    range!.setStartAfter(hashtag_popup_container_span)
    range!.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  removeHashTagPopupContainer() {
    if(document.getElementById(this.tagPopupContainerId)) {
      let elem = document.getElementById(this.tagPopupContainerId)!
      if (elem.parentNode) {
        let parent = elem.parentNode!

        if(this.taggingComponentRef) {
          this.taggingComponentRef.destroy()
          //this.taggingComponentRef.nativeElement.remove()
        }
        parent.removeChild(elem)

        this.taggingComponentRef = null
        this.hashtagContainer = null
        this.isHashTagPopupContainerOpen = false
      }
    }
  }

  swapHashtag(
    data: any
  ): void {
    this.removeHashTagPopupContainer()
    let elem:HTMLElement|null = null
    if(this._descrInputRef) {
      elem = this._descrInputRef.nativeElement as HTMLElement
    } else if(this._searchRef) {
      elem = this._searchRef.nativeElement as HTMLElement
    }
    let old_text = elem!.textContent
    let new_text = null

    if(old_text!.endsWith(data!.user_input)) {
      new_text = old_text!.replace(new RegExp(data!.user_input + '$'), data!.hashtag)
    } else {
      new_text = old_text!.replace(data!.user_input + ' ', data!.hashtag)
    }
    elem!.textContent = new_text
    if(this._descrInputRef) {
      // annotations input
      this.form!.patchValue({
        'description': new_text
      })
    } else if(this._searchRef) {
      // search input
      this.rightForm!.patchValue({search: new_text})
    }
    setTimeout(() => {
      this.setCaretToPositionEnd(elem)
    }, 0)
  }

  setCaretToPositionEnd(elem: any): void {
    const range = document.createRange()
    const sel = document.getSelection()
    range.selectNodeContents(elem)
    range.collapse(false)
    sel!.removeAllRanges()
    sel!.addRange(range)
  }

  handleHashtagInput(ev: KeyboardEvent): boolean {

    //console.log(ev)
    const selection = document.getSelection()!.anchorNode!

    if(ev.key == ' ' || ev.key == 'Enter') {
      if(ev.key == 'Enter') {
        ev.preventDefault()
      }
      this.removeHashTagPopupContainer()
      this._descrInputRef.nativeElement.innerHTML = this.removeNodesFromHTMLElement(this._descrInputRef.nativeElement)
      this.encloseHashtags()
      this.setCaretToPositionEnd(this._descrInputRef.nativeElement)
      return false
    } else if(ev.key == '#') {
      ev.preventDefault()
    } else if(ev.key == 'Backspace') {
      // already handled via getCurrentSelectionOffsetLength check further below
    }

    if(selection.nodeType == Node.TEXT_NODE) {
      setTimeout(() => { // TODO : hacky, find another way to read nodes textcontent
        if(this.getCurrentSelectionOffsetLength(selection) == 0) {
          this.removeHashTagPopupContainer()
          return false
        }
        let hashtag = selection.textContent!
        let hashtag_concise = hashtag
        if(/\s/.test(hashtag)) {
          // when empty spaces occur on textnode hashtag end on next empty space
          hashtag_concise = hashtag.substr(0, hashtag.indexOf(' '))!
        }
        this.taggingComponentRef.instance.updateHashtags(hashtag_concise)
      }, 0)
    }
    return true
  }

  removeNodesFromHTMLElement(element: HTMLElement) {
    //console.log('removeNodesFromHTMLElement', element)
    let text: string = ''
    element.childNodes.forEach((node: HTMLElement) => {
      if (node.nodeType === Node.TEXT_NODE) {
        //console.log('TEXT_NODE', node.textContent!.trim())
        let textContent = node.textContent!.trim()
        if(textContent) {
          text += textContent +' '
        }
      } else if(node.classList.contains(this.tagContainerClass)) {
        text += node.textContent!.trim() +' '
      }
    })
    text = text.replace(/#\s+/g, '')
    //console.log('TEXT', text)
    return text
  }

  removeNodesFromText(description: string): string {
    const descriptionNode = new DOMParser().parseFromString(description, 'text/html').body.childNodes
    let descriptionText: string = ''
    descriptionNode.forEach((item: HTMLElement) => {
      if(item.nodeType == Node.TEXT_NODE) {
        descriptionText += item.textContent
      } else if(item.classList.contains(this.tagContainerClass)) {
        descriptionText += item.textContent +' '
      }
    })
    this.isHashTagPopupContainerOpen = false
    return descriptionText
  }

  getCurrentSelectionOffsetLength(selection: Node) {
    let range = document.getSelection()!.getRangeAt(0)
    let preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(selection)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    return preCaretRange.toString().length
  }

  encloseHashtags(): void {
    let parent = this._descrInputRef.nativeElement
    this._descrInputRef.nativeElement.childNodes.forEach((node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let r = /#\w+/g
        let result = r.exec(node.nodeValue as string)
        //console.log('encloseHashtags', result)
        if(!result) { return } else {
          parent.innerHTML = node.nodeValue!.replace(
            r,
            '<span class="'+this.tagContainerClass+'" contenteditable="false">'
              +'$&'
              +'<span class="'+this.tagContainerCloseClass+' ion-ios-close-circle" contenteditable="false"></span>'
            +'</span>'
          )
        }
      }
    })
  }

  removeHashTag(target: HTMLElement) {
    //console.log(target)
    if(target.classList.contains(this.tagContainerCloseClass)) {
      const p = target.parentNode as HTMLElement
      const container = target.parentNode!.parentNode! as HTMLElement
      if(p.classList.contains(this.tagContainerClass)) {
        p.parentNode!.removeChild(p)
        this.isHashTagPopupContainerOpen = false

        // update FormBuilder form
        this.form!.patchValue({
          'description': container.textContent
        })
        this.encloseHashtags()
        this.setCaretToPositionEnd(container)
      }
    }
  }
}
