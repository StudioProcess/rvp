import {
  Injectable,
  ElementRef,
} from '@angular/core'

import {InspectorEntryComponent} from '../core/components/inspector/inspectorEntry/inspectorEntry.component'
@Injectable({
  providedIn: 'root',
})
export class HashtagOperations {
  InspectorEntryComponentRef: InspectorEntryComponent
  constructor() {}
}

export function prepareHashTagList(hashtags: []) {

  const uniq = Array.from(new Set(hashtags))
  const sorted = uniq.sort()

  return sorted
}

export function saveHashtags(
  InspectorEntryComponentRef: InspectorEntryComponent,
  description: string
) {
  const hashtags = description.match(/#\w+/g)
  InspectorEntryComponentRef.onHashtagsUpdate.emit({
    hashtags
  })
}

export function removeHashTag(
  InspectorEntryComponentRef: InspectorEntryComponent,
  target: HTMLElement,
  tagContainerClass: string,
  tagContainerCloseClass: string
) {
  //console.log(target)
  if(target.classList.contains(tagContainerCloseClass)) {
    const p = target.parentNode as HTMLElement
    const container = target.parentNode!.parentNode! as HTMLElement
    if(p.classList.contains(tagContainerClass)) {
      p.parentNode!.removeChild(p)
      InspectorEntryComponentRef.isHashTagPopupContainerOpen = false

      // update FormBuilder form
      InspectorEntryComponentRef.form!.patchValue({
        'description': container.textContent
      })
    }
  }
}

export function removeDescriptionNodes(
  InspectorEntryComponentRef: InspectorEntryComponent,
  description: string
) {
  const tagContainerClass = InspectorEntryComponentRef.tagContainerClass
  const descriptionNode = new DOMParser().parseFromString(description, 'text/html').body.childNodes
  let descriptionText = ''
  descriptionNode.forEach(function (item: HTMLElement) {
    if(item.nodeType == Node.TEXT_NODE) {
      descriptionText += item.textContent
    } else if(item.classList.contains(tagContainerClass)) {
      descriptionText += item.textContent +' '
    }
  })
  InspectorEntryComponentRef.isHashTagPopupContainerOpen = false
  return descriptionText
}

export function removeHashTagPopupContainer(InspectorEntryComponentRef: InspectorEntryComponent) {
  if(document.getElementById(InspectorEntryComponentRef.tagPopupContainerId)) {
    let elem = document.getElementById(InspectorEntryComponentRef.tagPopupContainerId)!
    if (elem.parentNode) {
      let parent = elem.parentNode!
      //console.log('removeHashTagPopupContainer', elem)

      if(InspectorEntryComponentRef.taggingComponentRef) {
        InspectorEntryComponentRef.taggingComponentRef.destroy()
        //InspectorEntryComponentRef.taggingComponentRef.nativeElement.remove()
      }
      parent.removeChild(elem)

      InspectorEntryComponentRef.taggingComponentRef = null
      InspectorEntryComponentRef.hashtagContainer = null
      InspectorEntryComponentRef.isHashTagPopupContainerOpen = false
    }
  }
}

export function swapHashtag(InspectorEntryComponentRef: InspectorEntryComponent, hashtag: string) {
  const selection = document.getSelection()
  const range = selection!.getRangeAt(0)!
  let rootNode = range.commonAncestorContainer //as Node
  const oldText = rootNode.nodeValue

  let hasSpace = oldText!.indexOf(' ')
  if(hasSpace >= 0) {
    hashtag = hashtag + oldText!.slice(hasSpace)
  }

  // update node
  removeHashTagPopupContainer(InspectorEntryComponentRef)
  rootNode.nodeValue = hashtag
  let parentNode = rootNode.parentNode as HTMLElement
  parentNode.normalize()

  // update FormBuilder form
  InspectorEntryComponentRef.form!.patchValue({
    'description': parentNode.textContent
  })
}

export function handleHashtagInput(InspectorEntryComponentRef: InspectorEntryComponent, ev: KeyboardEvent) {
  if(ev.key == ' ' || ev.key == 'Enter') {
    //console.log(ev)
    if(ev.key == 'Enter') { ev.preventDefault() }
    removeHashTagPopupContainer(InspectorEntryComponentRef)

    return false
  }

  const selection = document.getSelection()!.anchorNode!
  if(selection.nodeType == Node.TEXT_NODE) {
    setTimeout(() => { // TODO : hacky, find another way to read nodes textcontent
      if(getCurrentSelectionOffsetLength(selection) == 0) {
        removeHashTagPopupContainer(InspectorEntryComponentRef)
        return false
      }
      let hashtag = selection.textContent!
      let hashtag_concise = hashtag
      if(/\s/.test(hashtag)) {
        // when empty spaces occur on textnode hashtag end on next empty space
        hashtag_concise = hashtag.substr(0, hashtag.indexOf(' '))!
      }
      InspectorEntryComponentRef.taggingComponentRef.instance.updateHashtags(hashtag_concise)
    }, 5)
  }
}

export function getCurrentSelectionOffsetLength(selection: Node) {
  let range = document.getSelection()!.getRangeAt(0)
  let preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(selection)
  preCaretRange.setEnd(range.endContainer, range.endOffset)

  return preCaretRange.toString().length
}

export function encloseHashtags(
  descrInputRef: ElementRef,
  tagContainerClass: string,
  tagContainerCloseClass: string
) {
  descrInputRef.nativeElement.childNodes.forEach((node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let r = /#\w+/g
      let result = r.exec(node.nodeValue as string)
      if(!result) { return } else {
        let parent = descrInputRef.nativeElement
        parent.innerHTML = node.nodeValue!.replace(
          r,
          '<span class="'+tagContainerClass+'" contenteditable="false">'
            +'$&'
            +'<span class="'+tagContainerCloseClass+' ion-ios-close-circle" contenteditable="false"></span>'
          +'</span>'
        )
      }
    }
  })
}

/**
 *  add a node within contenteditable container (left of the hashtag textnode before caret)
 *  which is used as the container (mainly positioning) of the tagging
 *  popup component (will be removed on any formblur, save, pick etc. event).
 */
export function addHashTagPopupContainer(InspectorEntryComponentRef: InspectorEntryComponent) {
  let range = document.getSelection()!.getRangeAt(0)!
  if(!range.collapsed) {
    range.deleteContents()
  }
  let hashtag_popup_container_span = document.createElement('span')
  hashtag_popup_container_span.id = InspectorEntryComponentRef.tagPopupContainerId
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
