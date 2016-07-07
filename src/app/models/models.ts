// Simple key-value map
interface Map {
  [key:string]: any;
}

// Optional descriptive fields (for tracks and annotations)
interface Fields extends Map {
  title?: string;
  description?: string;
}

// Marker with metadata
export interface Annotation {
  utc_timestamp: number;
  duration: number;
  fields?: Fields;
}

// Track containing annotations and metadata
export interface Track {
  annotations: Annotation[];
  color: string;
  fields?: Fields;
}

// Timeline containing tracks
export interface Timeline {
  duration: number;
  playhead: number;
  zoom: number;
  pan: number;
  tracks: Track[];
}

// Video resource with metadata
export interface Video {
  id: string;
  url: string;
  meta?: Map;
}

// Project containing the complete app state
export interface Project {
  video: Video;
  timeline: Timeline;
}
