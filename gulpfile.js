var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    path = require('path')

var paths = {
  src: ['src/**/*.js'],
  lib: 'lib',
  sourceRoot: path.join(__dirname, 'src')
}

gulp.task('babel', function () {
  return gulp.src(paths.src)
    .pipe(sourcemaps.init())
    .pipe(babel({loose: 'all'}))
    .pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot }))
    .pipe(gulp.dest(paths.lib))
})
gulp.task('watch', function() {
    gulp.watch(paths.src, ['babel'])
})

function test() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}))
}
gulp.task('test', ['lint-src', 'lint-test'], function() {
  require('babel/register')({ modules: 'common' })
  return test()
})
gulp.task('default', ['babel'])
