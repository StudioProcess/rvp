// generated on 2016-04-25 using generator-webapp 2.0.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import path from 'path';
import minimist from 'minimist';
import globby from 'globby';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

/*
 * TODO:
 * test: lint scripts and specs
 * serve: lint scripts
 * build: use templatecache for angular (views are not loaded from files because of CORS)
 * build: copy flowplayer assets (images, fonts)
 *
 */


/**
 * process styles
 * uses sass and autoprefixer (no concatenation/minification)
 * uses sourcemaps
 * places results in .tmp/styles
 * reloads browser-sync
 */
gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

// /**
//  * process scripts
//  * uses babel (no concatenation/minification)
//  * uses sourcemaps
//  * places results in .tmp/scripts
//  * reloads browser-sync
//  */
// gulp.task('scripts.old', () => {
//   return gulp.src('app/scripts/**/*.js')
//     .pipe($.plumber())
//     .pipe($.sourcemaps.init())
//     .pipe($.babel())
//     .pipe($.ngAnnotate())
//     .pipe($.sourcemaps.write('.'))
//     .pipe(gulp.dest('.tmp/scripts'))
//     .pipe(reload({stream: true}));
// });

/**
 * bundle ES6 scripts/modules (to CommonJS)
 */
function bundle(glob, filename) {
  let files = globby.sync(glob);
  // console.log(files);

  // // TODO: if no filename was given use first input file and add '.bundle' before extension
  // if (!filename) {
  //   let parsed = path.parse(files[0]);
  // }

  return browserify(files, {debug: true}) // use files array as entry points for bundle
    .transform(babelify) // use babel to transform es6 to es5 (modules are transpiled to commonjs)
    .bundle() // emits bundle contents as text stream
    .pipe($.plumber())
    .pipe(source(filename)) // convert to vinyl object stream using filename
    .pipe(buffer()); // file contents converted to buffer (for use with sourcemaps)
}

/**
 * bundle scripts
 * uses browserify
 * uses babel (no concatenation/minification)
 * uses sourcemaps ({debug:true} in browserify)
 * places results in .tmp/scripts/app.bundle.js
 * reloads browser-sync
 */
gulp.task('scripts', () => {
  return bundle('app/scripts/app.js', 'app.bundle.js')
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.ngAnnotate())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

/**
 * bundle specs
 * by default all specs (in test/spec/) are bundled
 * use cmd line arg '--spec file' to bundle a single spec file
 * files beginning with an underscore are always bundled
 */
gulp.task('scripts:test', () => {
  let args = minimist(process.argv.slice(2));
  let pattern = 'test/spec/**/*.js'; // all specs
  if (args.spec) {
    let parsed = path.parse(args.spec);
    pattern = `test/spec/**/${parsed.name}.js`; // spec provided by --spec arg
  }

  return bundle(['test/**/_*.js', pattern], 'spec.bundle.js')
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.ngAnnotate())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/spec'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

/**
 * copy angular views to dist folder
 * TODO: use gulp-angular-templatecache instead of a simple copy
 */
gulp.task('views', () => {
  return gulp.src('app/views/**/*.html')
    .pipe(gulp.dest('dist/views'));
});

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

/**
 * process html for build (dist folder)
 * fills 'build:css' and 'build:js' sections with links to minified js/css
 * minifies html
 */
gulp.task('html', ['styles', 'scripts', 'views', 'wiredep'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

/**
 * process images for build (dist/images folder)
 */
gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

/**
 * copy extra files from root to dist folder
 */
gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components',
        '/node_modules': 'node_modules'
      }
    },
    browser: "google chrome"
  });

  gulp.watch([
    'app/*.html',
    'app/views/**/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

/**
 * test specs
 * runs all specs by default
 * use cmd line arg '--spec file' to run a single spec file
 */
gulp.task('test', ['scripts:test'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    browser: "google chrome",
    server: {
      baseDir: 'test',
      routes: {
        '/spec': '.tmp/spec',
        '/bower_components': 'bower_components',
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']); // rebundle and reload when scripts change
  gulp.watch('test/spec/**/*.js', ['scripts:test']); // rebundle and reload when specs change
});

/**
 * inject bower components
 * fills 'bower:scss' sections in *.scss files
 * fills 'bower:css' and 'bower:js' sections in *.html files
 */
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
