// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

/// <reference path="../typings/index.d.ts" />
declare var module: { id: string };


// dummy declaration for 'https://github.com/jo/docuri'
declare module 'docuri' {
  export var route:any;
}


// manually declare localforage, since dt~localforage typings doesn't seem to work
// TODO: remove this and use proper typings
declare module 'localforage' {
  export var createInstance;
}
