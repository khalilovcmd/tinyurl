var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var server = require('gulp-express');
var encrypt = require("gulp-encrypt");

gulp.task('jshint', function () {
    gulp.src(['./controllers/*.js', './modules/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('server', function (cb) {
    server.run(['bin/www']);
});

gulp.task('encrypt', function (cb) {
    gulp.src('./config.js')
        .pipe(encrypt({
            encrypt: true,
            password: process.env.NODE_ENC_KEY
        }))
        .pipe(rename('./config.enc'))
        .pipe(gulp.dest("./"))
});

gulp.task('decrypt', function (cb) {
    gulp.src('./config.enc')
        .pipe(encrypt({
            encrypt: false
        }))
        .pipe(rename('./config.js'))
        .pipe(gulp.dest("./"))
});

gulp.task('tests', function (cb) {

    gulp.src('./test/*.js', {
            read: false
        })
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('default', ['jshint', 'encrypt', 'server', 'tests']);