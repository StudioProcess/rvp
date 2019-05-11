import {InspectorEntryComponent} from '../core/components/inspector/inspectorEntry/inspectorEntry.component'

export function prepareHashTagList(hashtags: []) {

  const uniq = Array.from(new Set(hashtags))
  const sorted = uniq.sort()

  return sorted
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
    setTimeout(() => { // TODO : ugly hack, find another way to read nodes textcontent

      if(InspectorEntryComponentRef.getCurrentSelectionOffsetLength(selection) == 0) {
        removeHashTagPopupContainer(InspectorEntryComponentRef)

        return false
      }

      let hashtag = selection.textContent!
      let hashtag_concise = hashtag
      if(/\s/.test(hashtag)) {
        // when empty spaces occur on textnode hashtag end on next empty space
        hashtag_concise = hashtag.substr(0, hashtag.indexOf(' '))!
      }
      //InspectorEntryComponentRef.taggingComponentRef.instance.passed_hashtag = hashtag_concise
      InspectorEntryComponentRef.taggingComponentRef.instance.updateHashtags(hashtag_concise)
      //InspectorEntryComponentRef.taggingComponentRef.hostView.detectChanges()
      //InspectorEntryComponentRef.taggingComponentRef.injector.get(ChangeDetectorRef).markForCheck() // or detectChanges()
      //InspectorEntryComponentRef.taggingComponentRef.instance._changeDetector.detectChanges()
      //InspectorEntryComponentRef.taggingComponentRef.instance.passed_hashtag = selection.nodeValue
      //InspectorEntryComponentRef.taggingComponentRef.instance.passed_hashtag = selection.textContent
    }, 5)
  }

  //InspectorEntryComponentRef.taggingComponentRef.instance.passed_hashtag_2 = selection.textContent
  //InspectorEntryComponentRef.taggingComponentRef.instance._changeDetector.detectChanges()
  //InspectorEntryComponentRef.taggingComponentRef.instance._changeDetector.markForCheck()
}
