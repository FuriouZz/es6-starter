var gulp       = require('gulp');
var config     = require('../config').browserify;
var babelCfg   = require('../config').babel;
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var babelify   = require('babelify');
var watchify   = require('watchify');
var browserify = require('browserify');
var notify     = require('gulp-notify');
var _          = require('lodash');
var gif        = require('gulp-if');
var uglify     = require('gulp-uglify');

gulp.task('browserify', function(){
    bundle({ watch: false, minify: false });
});

gulp.task('browserify:build', function(){
    bundle({ watch: false, minify: true });
});

gulp.task('browserify:watch', function(){
    bundle({ watch: true, minify: false });
});

function bundle(options){

    var watch = options.watch,
    minify    = options.minify,
    b         = null;

    if (watch) {
        _.assign(watchify.args, config.opts);
        b = watchify(browserify(watchify.args));
        b.on('update', rebundle);
    } else {
        b = browserify(config.opts);
    }

    if (minify) {
        b.transform(babelify.configure(babelCfg.options.dist));
    } else {
        b.transform(babelify.configure(babelCfg.options.dev));
    }

    function rebundle(){
        return b.bundle()
                .on('error', notify.onError(handleError))
                .pipe(source(config.source))
                .pipe(buffer())
                .pipe(gif(minify, uglify()))
                .pipe(gulp.dest(config.dstPath));
    }

    function handleError(error){
        return 'ERROR: ' + error;
    }

    rebundle();

}
