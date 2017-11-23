import * as moment from 'moment'

export function formatDuration(unixTime: number): string {
  return moment.unix(unixTime).utc().format('HH:mm:ss.SSS')
}

const parseDurationRegex = /^(?:(?:([0-9]*):)|(?:([0-9]*):([0-9]*):))?([0-9]*)(?:\.([0-9]*))?$/

export function parseDuration(durationStr: string): number {
  let result = parseDurationRegex.exec(durationStr)
  if(result === null) {
    return 0
  } else {
    let m1 = result[1] ? parseInt(result[1], 10) : 0;
    let h = result[2] ? parseInt(result[2], 10) : 0;
    let m2 = result[3] ? parseInt(result[3], 10) : 0;
    let s = result[4] ? parseInt(result[4], 10) : 0;
    let sFract = result[5] ? parseFloat('.'+result[5]) : 0;
    return h*3600 + m1*60 + m2*60 + s + sFract;
  }
}
