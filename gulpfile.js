const gulp = require('gulp')
const replace = require('gulp-replace')
const rename = require('gulp-rename')

const {commitHash} = require('./tools/commitHash')

gulp.task('prep:env', () => {
  return gulp.src(['src/environments/*.tpl'])
    .pipe(replace('%COMMIT%', commitHash))
    .pipe(rename({extname: '.ts'}))
    .pipe(gulp.dest('src/environments/'))
})
