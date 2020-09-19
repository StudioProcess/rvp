import {
  // Injectable,
  // ViewChild,
  // ElementRef,
} from '@angular/core'

import { DomService } from './dom.service'
import { TaggingComponent } from '../components/tagging/tagging.component'

/*@Injectable({
  providedIn: 'root',
})*/
export abstract class HashtagService {

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
  hashtagContainer: HTMLElement | null = null
  taggingComponentRef: any | null = null
  isHashTagPopupContainerOpen = false

  constructor(
    readonly _domService: DomService,
  ) { }

  /**
   *  entry points for new hashtags
   *  - opens hashtag popup
   *  - prepares for following input
   *  - prepares for hashtag picks
   *  - prepares for closing the popup and to process the input area
   */
  handleHashTag(ev: KeyboardEvent): void {
    if (!this.isHashTagPopupContainerOpen) {
      // container for the hashtag popup component
      this.addHashTagPopupContainer()

      // let elem = ev.target as HTMLElement
      this.hashtagContainer = document.getElementById(this.tagPopupContainerId)! as HTMLElement

      // const componentRef = this._domService.instantiateComponent(TaggingComponent)
      this.taggingComponentRef = this._domService.instantiateComponent(TaggingComponent)

      // subscribe to tagging components onClickOutside event
      this.taggingComponentRef.instance.closeHashTagContainer.subscribe(() => {
        this.removeHashTagPopupContainer().then((res) => { }, (err) => { })
      })

      this.taggingComponentRef.instance.passHashTagToContent.subscribe((data: any) => {
        this.swapHashtag(data)
      })

      this.taggingComponentRef.instance.passed_hashtag = '#'
      // const componentRefInstance = this._domService.getInstance(componentRef)
      this._domService.attachComponent(this.taggingComponentRef, this.hashtagContainer)

      this.isHashTagPopupContainerOpen = true
    }
  }

  saveHashtags(description: string): void {
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
  addHashTagPopupContainer(): void {
    const selected = document.getSelection()!
    if (selected.rangeCount) {
      let range = selected!.getRangeAt(0)!
      if (!range.collapsed) {
        range.deleteContents()
      }
      const hashtag_popup_container_span = document.createElement('span')
      hashtag_popup_container_span.id = this.tagPopupContainerId
      hashtag_popup_container_span.style.display = 'inline-block'
      hashtag_popup_container_span.contentEditable = 'false'

      range.insertNode(hashtag_popup_container_span)

      const sel = document.getSelection()!
      range = range!.cloneRange()
      range!.setStartAfter(hashtag_popup_container_span)
      range!.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  removeHashTagPopupContainer(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      if (document.getElementById(this.tagPopupContainerId)) {
        if (this.taggingComponentRef) {
          this.taggingComponentRef.destroy()
        }
        const elem = document.getElementById(this.tagPopupContainerId)!
        elem.remove()

        // if (elem.parentNode) {
        // let parent = elem.parentNode!
        // parent.removeChild(elem)
        // }
        this.taggingComponentRef = null
        this.hashtagContainer = null
        this.isHashTagPopupContainerOpen = false

        resolve(this.tagPopupContainerId + ' removed')
      } else {
        reject('no popup element ' + this.tagPopupContainerId)
      }
    })
      .then(result => {
        return { 'removed': true }
      })
      .catch(error => {
        return { 'removed': false, 'error': error }
      })
  }

  /**
   *  Simply Update Form Values
   *  (depending on which Form is active annotation/search)
   */
  patchFormValues(text: string): void {
    if (this._descrInputRef) {
      /**
       *  annotation input
       */
      this.form!.patchValue({
        'description': text
      })
    } else if (this._searchRef) {
      /**
       *  search input
       */
      this.rightForm!.patchValue({
        search: text
      })
    }
  }

  swapHashtag(data: any): void {
    this.removeHashTagPopupContainer()
    const elem = this.getCurrentFocusNativeElement()
    if (elem) {
      const old_text = elem!.textContent
      let new_text = null
      if (old_text!.endsWith(data!.user_input)) {
        /**
         *  hashtag at the very end
         */
        new_text = old_text!.replace(new RegExp(data!.user_input + '$'), data!.hashtag)
      } else if (old_text!.indexOf(data!.user_input + '\n') > -1) {
        /**
         *  hashtag at the end of a line
         */
        new_text = old_text!.replace(data!.user_input + '\n', data!.hashtag + '\n')
      } else if (old_text!.indexOf(data!.user_input + ' ') > -1) {
        /**
         *  hashtag followed by whitespace
         */
        new_text = old_text!.replace(data!.user_input + ' ', data!.hashtag)
      } else {
        new_text = old_text!.replace(data!.user_input + ' ', data!.hashtag)
      }

      /**
       *  Update Content
       */
      elem!.textContent = new_text
      this.patchFormValues(new_text)

      setTimeout(() => {
        this.encloseHashtags()
        this.setCaretToPositionEnd(elem)
      })
    }
  }

  setCaretToPositionEnd(elem: any): void {
    if (elem) {
      const range = document.createRange()
      const sel = document.getSelection()
      range.selectNodeContents(elem)
      range.collapse(false)
      sel!.removeAllRanges()
      sel!.addRange(range)
    }
  }

  handleHashtagInput(ev: KeyboardEvent): boolean {
    const selection = document.getSelection()!.anchorNode!
    const element = this.getCurrentFocusNativeElement()

    if (ev.key === ' ' || ev.key === 'Enter') {
      if (ev.key === 'Enter') {
        ev.preventDefault()
      }
      this.removeHashTagPopupContainer()
      const new_text = this.removeNodesFromHTMLElement(element)

      element!.innerHTML = new_text
      this.patchFormValues(new_text)

      this.encloseHashtags()
      this.setCaretToPositionEnd(element)

      return false
    } else if (ev.key === '#') {
      ev.preventDefault()
    } else if (ev.key === 'Backspace') {
      // already handled by getCurrentSelectionOffsetLength
    }

    /**
     *  handle userinput on hashtag popup open
     */
    if (selection.nodeType === Node.TEXT_NODE) {
      setTimeout(() => { // TODO : hacky, find another way to read nodes textcontent
        if (this.getCurrentSelectionOffsetLength(selection) === 0) {
          this.removeHashTagPopupContainer()
          return false
        }
        const hashtag = selection.textContent!
        let hashtag_concise = hashtag.split('\n')[0] // consider linebreak inside selection/textnode
        hashtag_concise = hashtag_concise.trim()
        /**
         *  when empty spaces occur on hashtag textnode -> remove
         */
        /*if(/\s/.test(hashtag)) {
          hashtag_concise = hashtag.substr(0, hashtag.indexOf(' '))!
        }*/
        this.taggingComponentRef.instance.updateHashtags(hashtag_concise)
      }, 0)
    }
    return true
  }

  removeNodesFromHTMLElement(element: HTMLElement | null): string {
    let text = ''
    if (element) {
      const elemArr = Array.from(element.childNodes)
      elemArr.forEach((node: HTMLElement) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent!
          if (textContent) {
            /**
             *  re-add linebreaks
             */
            if (/\r|\n/.exec(textContent)) {
              textContent.replace(/(?:\r\n|\r|\n)/g, '<br>')
            }
            text += textContent
          }
        } else if (node.classList.contains(this.tagContainerClass)) {
          text += node.textContent!.trim()
        }
      })
      // text = text.replace(/#\s+/g, '')
    }
    return text
  }

  removeNodesFromText(description: string): string {
    /**
     *  Remove possible Angular/Popup Artefacts
     */
    description = description.replace(/<!--(.|\n)*?-->/g, '')
    description = description.replace(/<rv-tagging.*<\/rv-tagging>/ig, '')
    // description = description.replace(/<span id=\"tag-container\".*<\/span>/ig, '')

    /**
     *  Remove HTML Elements
     */
    const el = document.createElement('div')
    el.innerHTML = description
    description = el.innerText

    /**
     *  Still, parse for remaining HTML Objects
     */
    let descriptionText = ''
    const descriptionNode = new DOMParser().parseFromString(description, 'text/html').body.childNodes
    const elemArr = Array.from(descriptionNode)

    elemArr.forEach((item: HTMLElement) => {
      if (item.nodeType === Node.TEXT_NODE) {
        descriptionText += item.textContent!.trimLeft()
      } else if (item.nodeType === Node.ELEMENT_NODE && item.nodeName === 'BR') {
        descriptionText += '\n'
      } else if (item.classList.contains(this.tagContainerClass)) {
        descriptionText += item.textContent!.trim() + ' '
      }
    })
    this.isHashTagPopupContainerOpen = false
    return descriptionText
  }

  getCurrentFocusNativeElement(): HTMLElement | null {
    let elem: HTMLElement | null = null
    if (this._descrInputRef) {
      elem = this._descrInputRef.nativeElement as HTMLElement
    } else if (this._searchRef) {
      elem = this._searchRef.nativeElement as HTMLElement
    }
    return elem
  }

  getCurrentSelectionOffsetLength(selection: Node): number {
    const range = document.getSelection()!.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(selection)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    return preCaretRange.toString().length
  }

  encloseHashtags(settings?: any): void {
    const elem = this.getCurrentFocusNativeElement()
    if (elem) {
      this.removeHashTagPopupContainer()
      const elemArr = Array.from(elem.childNodes)
      elemArr.forEach((node: HTMLElement) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // const r = /#\w+/g
          const r = /(^|\s)(#[a-z\d-]+)/gi // hash except part of url
          const result = r.exec(node.textContent as string)
          if (!result) { return } else {
            const nodeTextUp = node.textContent!.replace(
              r,
              '<span class="' + this.tagContainerClass + '" contenteditable="false">'
              + '$&'
              + '<span class="' + this.tagContainerCloseClass + ' ion-ios-close-circle" contenteditable="false"></span>'
              + '</span>'
            )

            if (settings && settings!.hasOwnProperty('replace')) {
              /**
               *  replace each textNode with all new elements
               *  (all remaining text elements + hashtags spans)
               */
              const replacementNode = document.createElement('div')
              replacementNode.innerHTML = nodeTextUp // + ' '
              const replacementNodeArr = Array.from(replacementNode.childNodes)
              replacementNodeArr.forEach((replace: HTMLElement) => {
                node.parentNode!.insertBefore(replace, node)
              })
              // node.parentNode.insertBefore(replacementNode, node)
              node.parentNode!.removeChild(node)
            } else {
              /**
               *  Simply replace whole textNode
               */
              elem!.innerHTML = nodeTextUp
            }
          }
        }
      })
    }
  }

  removeHashTag(target: HTMLElement): void {
    if (target.classList.contains(this.tagContainerCloseClass)) {
      const p = target.parentNode as HTMLElement
      const container = target.parentNode!.parentNode! as HTMLElement
      if (p.classList.contains(this.tagContainerClass)) {
        p.parentNode!.removeChild(p)
        this.isHashTagPopupContainerOpen = false

        const new_text = container.textContent as string
        this.patchFormValues(new_text)

        this.encloseHashtags()
        this.setCaretToPositionEnd(container)
      }
    }
  }

  htmlBr(description: string): string {
    const pat1 = new RegExp('<div>', 'g')
    const pat2 = new RegExp('</div>', 'g')
    return description.replace(pat1, '\n').replace(pat2, '')
  }

  encloseHrefs() {
    const elem = this.getCurrentFocusNativeElement()
    if (elem) {
      const urlified = this.urlify(elem.textContent) as string | undefined
      if (urlified) {
        elem!.innerHTML = urlified
      }
    }
  }

  deductHrefs() {
    const elem = this.getCurrentFocusNativeElement()
    if (elem) {
      let elemArr = Array.from(elem.childNodes)
      elemArr.forEach((node: HTMLElement, i) => {
        if (node instanceof HTMLElement && node.tagName === 'A') {
          elem.replaceChild(document.createTextNode(node.textContent as string), node)
        }
      })
    }
  }

  urlify(text: string | null) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text?.replace(urlRegex, function (url: string) {
      return '<a href="' + url + '" target="_blank" contenteditable="false" title="link to '+ url +'" onclick="event.stopPropagation();" class="annotation-link">' + url + '</a>'
    })
  }
}
