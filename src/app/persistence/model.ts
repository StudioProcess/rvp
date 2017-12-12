import {List, Record, Set} from 'immutable'

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

export const ProjectAnnotationSelectionRecordFactory = Record<ProjectAnnotationSelection>({
  range: Set(),
  pick: Set(),
  selected: null
})

export const ProjectSelectionRecordFactory = Record<ProjectSelection>({
  annotation: new ProjectAnnotationSelectionRecordFactory()
})

export const ProjectRecordFactory = Record<Project>({
  meta: null,
  video: null,
  selection: new ProjectSelectionRecordFactory(),
  snapshots: new ProjectSnapshotsRecordFactory(),
  clipboard: Set()
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
  annotationStacks: List([List([])])
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

export const enum VideoSource {
  None,
  Blob,
  Youtube,
  Vimeo
}

export const ProjectVideoRecordFactory = Record<ProjectVideo>({
  source: VideoSource.None,
  data: null
})

export const AnnotationColorMapRecordFactory = Record<AnnotationColorMap>({
  trackIndex: -1,
  track: null,
  annotationStackIndex: -1,
  annotationIndex: -1,
  annotation: new AnnotationRecordFactory(),
  color: '#000'
})

// Model

export interface Project {
  readonly meta: Record<ProjectMeta>|null
  readonly video: Record<ProjectVideo>|null,
  readonly selection: Record<ProjectSelection>
  readonly snapshots: ProjectSnapshots
  readonly clipboard: Set<Record<AnnotationSelection>>
}

export interface ProjectVideo {
  source: VideoSource,
  data: File|Blob|URL|null
}

export interface ProjectMeta {
  readonly id: number|null
  readonly timeline: Record<Timeline>|null
}

export interface ProjectSelection {
  readonly annotation: Record<ProjectAnnotationSelection>
}

export interface ProjectAnnotationSelection {
  readonly range: Set<Record<AnnotationSelection>> // ranged selection via shift click
  readonly pick: Set<Record<AnnotationSelection>> // picked selection via cmd click
  readonly selected: Record<AnnotationSelection>|null   // special usage
}

export const enum SelectionSource {
  None,
  Timeline,
  Inspector
}

export const AnnotationSelectionRecordFactory = Record<AnnotationSelection>({
  track: null,
  annotation: null,
  source: SelectionSource.None
})

export interface AnnotationSelection {
  readonly track: Record<Track>|null
  readonly annotation: Record<Annotation>|null
  readonly source: SelectionSource
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
  readonly annotationStacks: List<List<Record<Annotation>>>
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
  readonly track: Record<Track>|null
  readonly trackIndex: number // TODO: really needed?
  readonly annotationStackIndex: number
  readonly annotationIndex: number
  readonly annotation: Record<Annotation>
  readonly color: string
}
