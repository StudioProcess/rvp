import {List, Record} from 'immutable'

// Record factories

export const ProjectRecordFactory = Record<Project>({
  id: null,
  timeline: null,
  video: null
})

export const TimelineRecordFactory = Record<Timeline>({
  id: null,
  duration: 0,
  playhead: 0,
  zoom: 1,
  pan: 0,
  tracks: List([])
})

export const TrackFieldsRecordFactory = Record<TrackFields>({
  title: ''
})

export const TrackRecordFactory = Record<Track>({
  id: null,
  color: '#000',
  fields: new TrackFieldsRecordFactory(),
  annotations: List([])
})

export const AnnotationFieldsRecordFactory = Record<AnnotationFields>({
  title: '',
  description: ''
})

export const AnnotationRecordFactory = Record<Annotation>({
  id: null,
  utc_timestamp: 0,
  duration: 0,
  fields: new AnnotationFieldsRecordFactory()
})

export const AnnotationColorMapRecordFactory = Record<AnnotationColorMap>({
  trackIndex: -1,
  annotationIndex: -1,
  annotation: new AnnotationRecordFactory(),
  color: '#000'
})

// Model

export interface Project {
  readonly id: number|null
  readonly timeline: Record<Timeline>|null
  readonly video: Blob|null
}

export interface Timeline {
  readonly id: number|null
  readonly duration: number
  readonly playhead: number
  readonly zoom: number
  readonly pan: number
  readonly tracks: List<Record<Track>>
}

export interface Track {
  readonly id: number|null
  readonly color: string
  readonly fields: Record<TrackFields>
  readonly annotations: List<Record<Annotation>>
}

export interface TrackFields {
  readonly title: string
}

export interface Annotation {
  readonly id: number|null
  readonly utc_timestamp: number
  readonly duration: number
  readonly fields: Record<AnnotationFields>
}

export interface AnnotationFields {
  readonly title: string
  readonly description: string
}

export interface AnnotationColorMap {
  readonly trackIndex: number
  readonly annotationIndex: number
  readonly annotation: Record<Annotation>
  readonly color: string
}
