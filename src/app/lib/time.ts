import * as moment from 'moment'

export function formatDuration(unixTime: number): string {
  return moment.unix(unixTime).utc().format('HH:mm:ss.SSS')
}
