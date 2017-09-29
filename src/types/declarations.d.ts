// @types/jszip-utils: not existing
declare module 'jszip-utils' {
  function getBinaryContent(
    path: string,
    callback: (err: Error, data: ArrayBuffer|string) => void): void
}

/**
 * Add index signature to Window interface
 * to allow
 * ```
 *  let pace = window['Pace'];
 * ````
 * in src/app/app.component.ts
 */
interface Window {[key: string]: any}
