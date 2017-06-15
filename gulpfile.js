var gulp = require('gulp');
var sass = require('gulp-sass');
var cache = require('gulp-cached');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var fileinclude = require('gulp-file-include');
var svgSprite = require('gulp-svg-sprite');
var del = require('del');
var pump = require('pump');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync');
var portNumber = 3333;
var svgConfig = {
    "mode": {
        "defs": {
            "dest": "",
            "sprite": "sprite.svg"
        }
    }
};
var processors = [
  autoprefixer({ add: false, browsers: ['last 3 versions'] })
];

var paths = {
  srcHTML: 'src/**/*.html',
  srcSASS: 'src/sass/**/*.scss',
  srcJS: 'src/**/*.js',
  srcSVG: 'src/svg/*.svg',

  tmp: 'tmp',
  tmpHTML: 'tmp/*.html',
  tmpCSS: 'tmp/css/',
  tmpIncludes: 'tmp/includes/',
  tmpSVG: 'tmp/svg/',

  dist: 'dist',
  distHTML: 'tmp/*.html',
  distIncludes: 'dist/includes/',
  distCSS: 'dist/css/',
  distSVG: 'dist/svg/',
};

/**
 * DEVELOPMENT
 */

gulp.task('html', function () {
  return gulp.src(paths.srcHTML)
      .pipe(gulp.dest(paths.tmp));
});

gulp.task('sass', function() {
  return gulp.src(paths.srcSASS)
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(gulp.dest(paths.tmpCSS))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function () {
  return gulp.src(paths.srcJS)
      .pipe(cache('jsCopy'))
      .pipe(gulp.dest(paths.tmp))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('svg', function() {
    return gulp.src(paths.srcSVG)
        .pipe(svgSprite(svgConfig)).on('error', function(error){ console.log(error); })
        .pipe(gulp.dest(paths.tmpSVG))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('copy', ['sass', 'js', 'svg']);

gulp.task('compile', ['html'], function() {
  return gulp.src(paths.tmpHTML)
    .pipe(cache('htmlCompile'))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: paths.tmpIncludes
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('serve', ['copy', 'compile'], function() {
  browserSync.init({
    server: {
      baseDir: paths.tmp
    },
    port: portNumber
  })
})

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.srcSASS,['sass']);
  gulp.watch(paths.srcJS,['js']);
  gulp.watch(srcSVG,['svgsprite']);
  gulp.watch(paths.srcHTML, ['compile']);
});

gulp.task('default', ['watch']);

/**
 * PRODUCTION
 */
gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('compile:dist', ['html:dist'], function() {
  return gulp.src(paths.distHTML)
    .pipe(cache('htmlCompile'))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: paths.distIncludes
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('sass:dist', function() {
  return gulp.src(paths.srcSASS)
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(gulp.dest(paths.distCSS));
});

gulp.task('js:dist', function (cb) {
  pump([
      gulp.src(paths.srcJS),
      uglify(),
      gulp.dest(paths.dist)
    ],
    cb
  );
});

gulp.task('svg:dist', function() {
    return gulp.src(paths.srcSVG)
        .pipe(svgSprite(svgConfig)).on('error', function(error){ console.log(error); })
        .pipe(gulp.dest(paths.distSVG));
});

gulp.task('copy:dist', ['sass:dist', 'js:dist', 'svg:dist']);

gulp.task('clean:dist', ['copy:dist', 'compile:dist'], function () {
  del(paths.distIncludes);
});

gulp.task('build', ['clean:dist']);