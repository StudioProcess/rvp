declare module 'video.js'

/**
 * To allow
 * ```
 *  let pace = window['Pace'];
 * ````
 * in src/app/app.component.ts
 */
interface Window {[key: string]: any}
