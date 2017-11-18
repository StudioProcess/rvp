import {List, Record} from 'immutable'

// Record factories

export const ProjectRecordFactory = Record<Project>({
  id: null,
  timeline: null,
  videoBlob: null
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
  trackIndex: 0,
  annotation: new AnnotationRecordFactory(),
  color: '#000'
})

// Model

export interface Project {
  id: number|null
  timeline: Record<Timeline>|null
  videoBlob: Blob|null
}

export interface Timeline {
  id: number|null
  duration: number
  playhead: number
  zoom: number
  pan: number
  tracks: List<Record<Track>>
}

export interface Track {
  id: number|null
  color: string
  fields: Record<TrackFields>
  annotations: List<Record<Annotation>>
}

export interface TrackFields {
  title: string
}

export interface Annotation {
  id: number|null
  utc_timestamp: number
  duration: number
  fields: Record<AnnotationFields>
}

export interface AnnotationFields {
  title: string
  description: string
}

export interface AnnotationColorMap {
  trackIndex: number
  annotation: Record<Annotation>
  color: string
}
