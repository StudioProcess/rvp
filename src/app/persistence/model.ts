import {List, Record} from 'immutable'

// Record factories

export const ProjectMetaRecordFactory = Record<ProjectMeta>({
  id: null,
  timeline: null,
})

export const ProjectSnapshotRecordFactory = Record<ProjectSnapshot>({
  timestamp: -1,
  state: new ProjectMetaRecordFactory()
})

export const ProjectSnapshotsRecordFactory = Record<ProjectSnapshots>({
  undo: List<Record<ProjectSnapshot>>(),
  redo: List<Record<ProjectSnapshot>>()
})

export const ProjectRecordFactory = Record<Project>({
  meta: null,
  video: null,
  snapshots: new ProjectSnapshotsRecordFactory()
})

export const TimelineRecordFactory = Record<Timeline>({
  id: null,
  duration: -1,
  // playhead: -1,
  // zoom: -1,
  // pan: -1,
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
  utc_timestamp: -1,
  duration: -1,
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
  readonly meta: Record<ProjectMeta>|null
  readonly video: Blob|null,
  readonly snapshots: ProjectSnapshots
}

export interface ProjectMeta {
  readonly id: number|null
  readonly timeline: Record<Timeline>|null
}

/* Use List as double ended queue
 *  - unshift: Insert first
 *  - shift: Remove first
 *  - first: Get first
 *  - pop: Remove last
 */
export interface ProjectSnapshots {
  readonly undo: List<Record<ProjectSnapshot>>
  readonly redo: List<Record<ProjectSnapshot>>
}

export interface ProjectSnapshot {
  readonly timestamp: number
  readonly state: Record<ProjectMeta>
}

export interface Timeline {
  readonly id: number|null
  readonly duration: number
  // readonly playhead: number
  // readonly zoom: number
  // readonly pan: number
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
