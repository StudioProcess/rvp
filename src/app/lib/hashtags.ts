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
      console.log('removeHashTagPopupContainer', elem)

      if(InspectorEntryComponentRef.taggingComponentRef) {
        InspectorEntryComponentRef.taggingComponentRef.destroy()
        //this.taggingComponentRef.nativeElement.remove()
        console.log('taggingComponentRef DESTROYED')
      }
      parent.removeChild(elem)

      InspectorEntryComponentRef.taggingComponentRef = null
      InspectorEntryComponentRef.hashtagContainer = null
      InspectorEntryComponentRef.isHashTagPopupContainerOpen = false
    }
  }
}

export function swapHashtag(InspectorEntryComponentRef: any, hashtag: string) {
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

  // update also FormBuilder form
  InspectorEntryComponentRef.form.patchValue({'description': parentNode.textContent})
}
