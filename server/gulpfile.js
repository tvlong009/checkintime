var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require("gulp-uglify");
var clean = require('gulp-clean');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
  js: ['./public/js/**/*.js'],
  jsFile:'app.min.js',
  cssFile:'app.min.css',
  dest: "./public/min/",
  destcss: "./public/css/"
};

gulp.task('default', ['scripts', 'css']);

gulp.task('scripts', function() {
  gulp.src(paths.js)
  .pipe(ngAnnotate({
    remove: true,
    add: true,
    single_quotes: true
  }))
    .pipe(uglify())
    .pipe(concat(paths.jsFile))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('css', ['cleanCSS'], function() {
  gulp.src([
    './public/css/style.css'
  ])
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(concat(paths.cssFile))
      .pipe(gulp.dest(paths.destcss));
});


gulp.task('cleanJS', function() {
  return gulp.src(paths.dest)
    .pipe(clean());
});

gulp.task('cleanCSS', function() {
  return gulp.src(paths.destcss + paths.cssFile)
      .pipe(clean());
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch('./public/**/*.css', ['css']);
});