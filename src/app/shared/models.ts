/**
 * Utilities (this file only)
 */

// Simple key-value map
interface Map {
  [key:string]: any;
}

// Optional descriptive fields (for tracks and annotations)
interface Fields extends Map {
  title?: string;
  description?: string;
}



/**
 * Exported Types
 */

// Time is a timestamp or duration in seconds since UNIX epoch (fractional part possible)
export type Time = number;

// Marker with metadata
export interface Annotation {
  utc_timestamp: Time;
  duration: Time;
  fields?: Fields;
  isSelected?: boolean;
}

export interface InspectorEntry {
  annotation: Annotation;
  color: string;
}

// Track containing annotations and metadata
export interface Track {
  annotations: Annotation[];
  color: string;
  fields?: Fields;
}

// Timeline containing tracks
export interface Timeline {
  duration: Time;
  playhead: Time;
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

export interface State {
  project: Project;
}
