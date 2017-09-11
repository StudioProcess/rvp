declare module 'video.js' // @types/video.js: declarations out of date
declare module 'jszip' // @types/video.js: declarations out of date
declare module 'jszip-utils' // @types/jszip-utils: not existing

/**
 * Add index signature to Window interface
 * to allow
 * ```
 *  let pace = window['Pace'];
 * ````
 * in src/app/app.component.ts
 */
interface Window {[key: string]: any}
