export interface Annotation {
  utc_timestamp: number,
  duration: number,
  fields: {
    title: string,
    description: string
  }
}
