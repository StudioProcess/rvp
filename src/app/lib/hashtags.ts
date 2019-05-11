
export function prepareHashTagList(hashtags: []) {

  const uniq = Array.from(new Set(hashtags))
  const sorted = uniq.sort()

  return sorted
}

export function removeHashTagPopupContainer(that: any) {
  if(document.getElementById(that._tag_popup_container_id)) {
    let elem = document.getElementById(that._tag_popup_container_id)!
    if (elem.parentNode) {
      let parent = elem.parentNode!
      console.log('removeHashTagPopupContainer', elem)

      if(that._taggingComponentRef) {
        that._taggingComponentRef.destroy()
        //this._taggingComponentRef.nativeElement.remove()
        console.log('_taggingComponentRef DESTROYED')
      }
      parent.removeChild(elem)

      that._taggingComponentRef = null
      that._hashtagContainer = null
      that._isHashTagPopupContainerOpen = false
    }
  }
}

export function swapHashtag(that: any, hashtag: string) {
  const selection = document.getSelection()
  const range = selection!.getRangeAt(0)!
  let rootNode = range.commonAncestorContainer //as Node
  const oldText = rootNode.nodeValue

  let hasSpace = oldText!.indexOf(' ')
  if(hasSpace >= 0) {
    hashtag = hashtag + oldText!.slice(hasSpace)
  }

  // update node
  removeHashTagPopupContainer(that)
  rootNode.nodeValue = hashtag
  let parentNode = rootNode.parentNode as HTMLElement
  parentNode.normalize()

  // update also FormBuilder form
  that.form.patchValue({'description': parentNode.textContent})
}
