import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { List, Record, Set } from 'immutable'
import { Annotation } from '../../../../persistence/model'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../../reducers'
import * as fromProject from '../../../../persistence/reducers'
import * as project from '../../../../persistence/actions/project'
import { AnnotationRecordFactory, AnnotationFieldsRecordFactory, Track } from '../../../../persistence/model'

@Component({
  selector: 'rv-tag-add-modal',
  host: {
    '(mousedown)': 'hashtagAddModalClick($event)',
  },
  templateUrl: './tag-add-modal.component.html',
  styleUrls: ['./tag-add-modal.component.scss']
})
export class TagAddModalComponent implements OnInit {

  @ViewChild('addHashtagInput', { static: true }) readonly addHashtagInput: ElementRef
  hashtags: string[] = []
  selectedHashtag: string = ''
  selectedAnnotations: Set<Record<Annotation>>
  tracks: any

  constructor(
    private _rootStore: Store<fromRoot.State>
  ) {
    this._rootStore.select(fromProject.getProjectMeta).subscribe(meta => {
      if (meta !== null) {
        const tags = meta!.getIn(['hashtags', 'list'])!
        this.hashtags = (tags) ? tags : []
        this.tracks = meta!.getIn(['timeline', 'tracks'])
      }
    })

    this._rootStore.select(fromProject.getSelectedAnnotations)
      .subscribe(selAnnotations => {
        this.selectedAnnotations = selAnnotations
        //console.log('this.selectedAnnotations', this.selectedAnnotations)
      })
  }

  ngOnInit() {
  }

  /**
   *  prevent annotation from de-selecting
   */
  hashtagAddModalClick($event: MouseEvent) {
    $event.stopPropagation()
  }

  /**
   *  build complete path info in order to update annotation
   *  or respectively use ProjectUpdateAnnotation method
   */
  getAnnotationStorePathById(search_id: number | null): any {
    let path = null
    this.tracks!.find((track: Record<Track>, trackIndex: number) => {
      const annotationStacks = track.get('annotationStacks', null)
      annotationStacks.forEach((annotationStack: List<Record<Annotation>>, annotationStackIndex: number) => {
        annotationStack.forEach((annotation: Record<Annotation>, annotationIndex: number) => {
          const curId = annotation.get('id', null)
          if (curId === search_id) {
            path = {
              'trackIndex': trackIndex,
              'annotationStackIndex': annotationStackIndex,
              'annotationIndex': annotationIndex,
              'annotationId': curId
            }
            return true
          }
        })
      })
      return false
    })
    return path
  }

  /**
   *  - go through all selected annotations
   *  - find pathInfo in order to save (via ProjectUpdateAnnotation)
   *  - update annotation text with selected hashtag
   *  - save (via ProjectUpdateAnnotation)
   */
  addHashtag(hashtag: string) {
    this.selectedAnnotations.find((sel) => {
      const annotationId = sel.get('id', null)
      const pathInfo = this.getAnnotationStorePathById(annotationId!)
      if (pathInfo) {
        const annotation_duration = sel.get('duration', null)
        const annotation_timestamp = sel.get('utc_timestamp', null)
        const annotation_text = sel.getIn(['fields', 'description'])
        const annotation_text_new = annotation_text.trim() + ' ' + hashtag
        const pointer_element = sel.get('pointerElement', null)

        const annotation = new AnnotationRecordFactory({
          id: annotationId,
          utc_timestamp: annotation_timestamp,
          duration: annotation_duration,
          fields: new AnnotationFieldsRecordFactory({ description: annotation_text_new }),
          pointerElement: pointer_element
        })
        const updateAnnotation = {
          trackIndex: pathInfo!.trackIndex,
          annotationStackIndex: pathInfo!.annotationStackIndex,
          annotationIndex: pathInfo!.annotationIndex,
          annotation
        }

        this._rootStore.dispatch(new project.ProjectUpdateAnnotation(updateAnnotation))
      }
      /**
       *  don't break the loop until all selected annotations are updated/saved
       */
      return false
    })

    this.addHashtagInput.nativeElement.value = ''
    this.selectedHashtag = ''
  }

  selectAddHashtag(event: any, hashtag: string) {
    this.selectedHashtag = hashtag
  }

  addNewHashtag($event: any) {
    const regexp = new RegExp('#([^\\s]*)', 'g')
    this.addHashtagInput.nativeElement.value = this.addHashtagInput.nativeElement.value.replace(regexp, '')
    this.selectedHashtag = '#'+ this.addHashtagInput.nativeElement.value
  }
}
