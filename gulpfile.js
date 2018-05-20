/* eslint-env node, mocha */

const gulp = require('gulp');
const runSequence = require('run-sequence');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const del = require('del');

// Minify html files
gulp.task('minify', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'));
});

// Minify js files
gulp.task('uglify', function () {
  return gulp.src('src/js/*.js')
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify( /* options */ ))
    .pipe(gulp.dest('dist/js'));
});

// Minify service worker
gulp.task('uglify-sw', function () {
  return gulp.src('src/sw.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify( /* options */ ))
    .pipe(gulp.dest('dist'));
});

// Minify css files
gulp.task('minify-css', () => {
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest('dist/css'));
});

// Copy images to dist folder
gulp.task('copy-images', () => {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'));
});

// Copy manifest.json to dist folder
gulp.task('copy-manifest', () => {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'));
});

// Clean files
gulp.task('clean', () => {
  return del('dist', {
    force: true
  });
});

// Run all task: gulp, gulp dev
const defaultTask = () => {
  // Watch html files
  gulp.watch('src/*.html', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start(['minify']);
  });

  // Watch js files
  gulp.watch('src/js/*.js', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start(['uglify']);
  });

  // Watch service worker file
  gulp.watch('src/sw.js', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start(['uglify-sw']);
  });

  // Watch manifest.json file
  gulp.watch('src/manifest.json', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start(['copy-manifest']);
  });

  // Watch css files
  gulp.watch('src/css/*.css', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.start(['minify-css']);
  });
  runSequence('clean', ['minify', 'uglify', 'uglify-sw', 'minify-css', 'copy-images', 'copy-manifest']);
};
gulp.task('default', defaultTask);
gulp.task('dev', defaultTask);

// Run all task: gulp build
const buildTask = () => {
  runSequence('clean', ['minify', 'uglify', 'uglify-sw', 'minify-css', 'copy-images', 'copy-manifest']);
};
gulp.task('build', buildTask);
