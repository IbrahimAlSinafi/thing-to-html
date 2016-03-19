var gulp = require('gulp');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');

gulp.task('styles', function() {
  return gulp.src('thing.less')
    .pipe(less())
    .on('error', onError)
    .pipe(prefix({browsers: ['last 2 versions']}))
    .pipe(gulp.dest(''));
});

gulp.task('example_styles', function() {
  return gulp.src('demo/example.less')
    .pipe(less())
    .on('error', onError)
    .pipe(prefix({browsers: ['last 2 versions']}))
    .pipe(gulp.dest('demo'));
});

gulp.task('default', ['styles'], function() {
  gulp.watch('thing.less', ['styles']);
  gulp.watch('demo/example.less', ['example_styles']);
});

// http://goo.gl/SboRZI
// Prevents gulp from crashing on errors.
function onError(err) {
  console.log(err);
  this.emit('end');
}