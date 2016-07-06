// SystemJS configuration file, see links for more information
// https://github.com/systemjs/systemjs
// https://github.com/systemjs/systemjs/blob/master/docs/config-api.md

/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map: any = {
  'jquery': 'vendor/jquery/dist/jquery.js',
  'foundation': 'vendor/foundation-sites/dist/foundation.js',
  'pouchdb': 'vendor/pouchdb/dist/pouchdb.js',
  'lodash': 'vendor/lodash/lodash.js',
  'node-uuid': 'vendor/node-uuid/uuid.js',
  'docuri': 'vendor/docuri/index.js',
  'video.js': 'vendor/video.js/dist/video.js',
  'ajv': 'vendor/ajv/dist/ajv.bundle.js',
  '@ngrx': 'vendor/@ngrx'
};



/** User packages configuration. */
const packages: any = {
  '@ngrx/core': {
    main: 'index.js',
    format: 'cjs'
  },
  '@ngrx/store': {
    main: 'index.js',
    format: 'cjs'
  }
};

const meta: any = {
  'foundation': {
    deps: ['jquery']
  },
  'video.js': {
    format: 'global',
    exports: 'videojs'
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',

  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'app',
  'app/shared',
  'app/video',
  'app/inspector',
  'app/timeline',
  'app/filepicker',
  'app/project-io',
  'app/project-info',
  'app/inspectorentry',
  'app/timeline-annotation',
  'app/timeline-track',
  'app/timeline/track',
  'app/timeline/track/annotation',
  'app/timeline/playhead',
  /** @cli-barrel */
];

const cliSystemConfigPackages: any = {};
barrels.forEach((barrelName: string) => {
  cliSystemConfigPackages[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js'
  },
  packages: cliSystemConfigPackages
});

// Apply the user's configuration.
System.config({ map, packages, meta });
