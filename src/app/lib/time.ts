import * as moment from 'moment'

export function formatDuration(unixTime: number, short: boolean = false): string {
  return short ? formatDurationShort(unixTime) : formatDurationLong(unixTime)
}

export function formatDurationLong(unixTime: number): string {
  return moment.unix(unixTime).utc().format('HH:mm:ss.SSS')
}

export function formatDurationCombined(unixTime: number, seconds: boolean = false): string {
  return seconds ? Math.round(unixTime) + ' | ' + moment.unix(unixTime).utc().format('m:ss') : formatDurationLong(unixTime)
}

export function formatDurationShort(unixTime: number): string {
  return Math.round(unixTime) + ''
}

const parseDurationRegex = /^(?:(?:([0-9]*):)|(?:([0-9]*):([0-9]*):))?([0-9]*)(?:\.([0-9]*))?$/

export function parseDuration(durationStr: string, short: boolean = false): number {
  return short ? parseDurationShort(durationStr) : parseDurationLong(durationStr)
}

export function parseDurationLong(durationStr: string): number {
  const result = parseDurationRegex.exec(durationStr)
  if(result === null) {
    return 0
  } else {
    const m1 = result[1] ? parseInt(result[1], 10) : 0
    const h = result[2] ? parseInt(result[2], 10) : 0
    const m2 = result[3] ? parseInt(result[3], 10) : 0
    const s = result[4] ? parseInt(result[4], 10) : 0
    const sFract = result[5] ? parseFloat('.'+result[5]) : 0
    return h*3600 + m1*60 + m2*60 + s + sFract
  }
}

export function parseDurationShort(durationStr: string): number {
  const items = durationStr.split(' | ')
  return parseFloat(items[0])
}
