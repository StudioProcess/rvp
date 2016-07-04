export interface Annotation {
  utc_timestamp: number,
  duration: number,
  fields?: {
    title?: string,
    description?: string
  }
}

export interface Track {
  annotations:Annotation[],
  color:number
}

export interface Timeline {
  playhead:number,
  zoom:number,
  pan:number,
  tracks:Track[]
}

export interface Video {
  id:string,
  url:string,
  meta?
}

export interface Project {
  video:Video,
  timeline:Timeline
}
