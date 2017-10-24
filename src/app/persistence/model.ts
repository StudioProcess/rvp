export interface Timeline {
  duration: number
  playhead: number
  zoom: number
  pan: number
  tracks: Track[]
}

export interface Track {
  color: string
  fields: {title: string}
  annotations: Annotation[]
}

export interface Annotation {
  utc_timestamp: number
  duration: number
  fields: {
    title: string
    description: string
  }
}

export interface AnnotationColorMap {
  trackIndex: number
  annotation: Annotation
  color: string
}
