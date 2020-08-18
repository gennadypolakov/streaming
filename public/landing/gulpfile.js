let gulp = require('gulp');
let sass = require('gulp-sass');
let csso = require('gulp-csso');
let concatCSS = require('gulp-concat-css');

gulp.task('sass', function(){
  return gulp.src('styles/*.scss')
    .pipe(sass())
    .pipe(concatCSS('main.css'))
    .pipe(csso())
    .pipe(gulp.dest('styles'))
});

gulp.task('watch', function(){
  return gulp.watch('styles/main.scss', ['sass'])
});

gulp.task('default', [ 'sass', 'watch' ]);