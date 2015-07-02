/**
 *      ES6-AngularJS-TwitterBootstrap-Gulp Starter
 *      Copyright 2014-2015 Hiram Software
 *
 *      This is the file that builds your site based on Gulp
 *      http://gulpjs.com/
 *
 * Q:   Why doesn't this gulpfile use require-dir as shown in the recipe
 *      https://github.com/gulpjs/gulp/blob/master/docs/recipes/using-external-config-file.md
 *
 * A1:  As a starter, it is important to support your configuration.
 *      require-dir does not yet support passing in parameters
 *      https://github.com/aseemk/requireDir/issues/15
 *
 * A2:  As a practical matter, the gulpfile will be updated
 *      while downstream projects will have thrown away the rest.
 *      Keeping everything in one gulpfile makes it easier to
 *      copy the latest version into your downstream project.
 **/


// Dependencies
var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var sass = require('gulp-sass');
var path = require('path');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var minifyCSS = require('gulp-minify-css');
var rename = require("gulp-rename");
var htmlreplace = require('gulp-html-replace');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var revision = require('git-rev');
var swig = require('gulp-swig');
var gls = require('gulp-live-server');
var concatCss = require('gulp-concat-css');
var sizereport = require('gulp-sizereport');

////////////////////////////////////////
//////// Configuration
////////////////////////////////////////

//////// Base directory of your source
var baseSrcPath = "src";
var baseMainPath = baseSrcPath + "/main";
//////// Base directory of your output
var baseDestPath = "dist";
//////// Folder where intermediate output is stored
var interOutput = "target";

//////// How to call jspm bundle-sfx
var jspmBundleSfx = [
    {
        id: "main", // the id to make available in htmlreplace. prefixed with 'js', e.g. 'jsmain'
        in: "bootstrap.js", // the input file in
        out: "build.js" // the output file
    }
];

//////// The actual bundle-sfx calls
var bundleJspmTasks = [];
for(var i in jspmBundleSfx){
    var jspm = jspmBundleSfx[i];
    bundleJspmTasks.push(
        'jspm bundle-sfx ' + jspm.in + ' ' + interOutput + "/" + jspm.out
    );
}

//////// Filename for compiled css
var cssBasename = 'app'; // as in app.css
// Note: both the LESS and SCSS gets compiled together into one css file

var fontsSrc = [baseMainPath + "/less/**/fonts/*", baseMainPath + "/scss/**/fonts/*"];
var fontsDest = baseDestPath + "/fonts";

//////// Entry point for LESS
var lessSrc = baseMainPath + '/less/app.less';

//////// Entry point for SCSS
var scssSrc = baseMainPath + '/scss/app.scss';

//////// Where to find other un-compiled CSS to concatenate
var cssSrc = baseMainPath + '/css/**/*.css';
var cssDest = baseDestPath;

var jsSrc = baseMainPath + '/js/**/*.js';
var jsDest = baseDestPath;

var es6Src = [baseMainPath + '/es6/**/*.js', baseMainPath + '/es6/**/*.es6'];

//////// Note that '_layout' is excluded
var htmlSrc = ['!' + baseMainPath + '/html/{_layout,_layout/**}', baseMainPath + '/html/**/*.html'];
var htmlDest = baseDestPath;

var staticSrc = baseMainPath + '/static/**/*';
var staticDest = baseDestPath;

var dataSrc = baseMainPath + '/data/**/*';
var dataDest = baseDestPath + '/data';

function reportChange(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

function errorHandler (error) {
    console.log(error.toString());
    this.emit('end');
}

////////////////////////////////////////
//////// Build tasks (i.e. take input files and transform)
////////////////////////////////////////

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('build-html', function(cb) {
    var gitInfo = {
        short : "Development",
        branch: "master"
    };
    revision.short(function (str) {
        gitInfo.short = str;
        revision.branch(function (str) {
            gitInfo.branch = str;

            var htmlreplaceParams = {
                'css': cssBasename + '.css',
                'gitRevShort' : gitInfo.short,
                'gitBranch': gitInfo.branch
            };

            for(var i in jspmBundleSfx){
                var jspm = jspmBundleSfx[i];
                htmlreplaceParams['js' + jspm.id] = jspm.out;
            }

            gulp.src(htmlSrc)
                .pipe(swig({
                    defaults: {
                        cache: false,
                        varControls : ['%{{', '}}%']
                    }
                }))
                .pipe(htmlreplace(htmlreplaceParams))
                .pipe(gulp.dest(htmlDest));
            cb();
        });
    });

});

gulp.task('build-less', function () {

    return gulp.src(lessSrc)
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(rename(function (path) {
            path.basename = 'less';
        }))
        .pipe(gulp.dest(interOutput));

});

gulp.task('build-scss', function () {

    return gulp.src(scssSrc)
        .pipe(sass())
        .pipe(rename(function (path) {
            path.basename = 'sass';
        }))
        .pipe(gulp.dest(interOutput));

});

gulp.task('bundle-jspm', shell.task(bundleJspmTasks, {quiet : false}));
////////////////////////////////////////
//////// Copy tasks (i.e. take input files verbatim)
////////////////////////////////////////

gulp.task('copy-fonts', function() {
    return gulp.src(fontsSrc)
        .pipe(rename(function (path) {
            path.dirname = '.';
        }))
        .pipe(gulp.dest(fontsDest));
});

gulp.task('copy-static', function() {
    return gulp.src(staticSrc)
        .pipe(gulp.dest(staticDest));
});

gulp.task('copy-css', ['build-less', 'build-scss'], function() {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer-core');

    return gulp.src([cssSrc, interOutput + "/**/*.css"])
        .pipe(concatCss(cssBasename + ".css"))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(rename(function (path) {
            path.basename = cssBasename;
        }))
        .pipe(gulp.dest(cssDest));
});

gulp.task('copy-data', function() {
    return gulp.src(dataSrc)
        .pipe(gulp.dest(dataDest));
});

gulp.task('copy-es6', ['bundle-jspm'], function() {
    return gulp.src([interOutput + "/**/*.js"])
        .pipe(gulp.dest(jsDest));
});

gulp.task('copy-js', function() {
    return gulp.src([jsSrc])
        .pipe(gulp.dest(jsDest));
});

gulp.task('minifycss', ['copy-css'], function() {
    return gulp.src([cssDest + "/**/*.css"])
        .pipe(minifyCSS())
        .pipe(gulp.dest(cssDest));
});

gulp.task('minifyjs', ['copy-js', 'copy-es6'], function(){
    return gulp.src([jsSrc, interOutput + "/**/*.js"])
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('minify', ['minifycss', 'minifyjs']);

////////////////////////////////////////
//////// Clean tasks
////////////////////////////////////////

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src([baseDestPath, interOutput], { read: false })
        .pipe(clean());
});

////////////////////////////////////////
//////// Development tasks
////////////////////////////////////////

gulp.task('serve', ['default', 'watch'], function() {

    //2. serve at custom port
    var server = gls.static(baseDestPath, 8080);
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    return gulp.watch([baseDestPath + '/**/*'], function () {
        server.notify.apply(server, arguments);
    });
});

// serve-prod is to test out minified builds
// use serve for active development
gulp.task('serve-prod', ['dist'], function() {

    //2. serve at custom port
    var server = gls.static(baseDestPath, 8080);
    server.start();

});

gulp.task('sizereport', function() {
    return gulp.src([baseDestPath + "/**/*.js", baseDestPath + "/**/*.css"])
        .pipe(sizereport({
            gzip : true
        }));
});

////////////////////////////////////////
//////// Porcelain tasks
////////////////////////////////////////

gulp.task('default', ['build', 'copy']);

gulp.task('build', ['bundle-jspm', 'build-less', 'build-scss', 'build-html']);

gulp.task('copy', ['copy-fonts', 'copy-static', 'copy-css', 'copy-data', 'copy-js', 'copy-es6']);

gulp.task('watch', ['default'], function() {
    gulp.watch([lessSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([scssSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([es6Src], ['copy-es6']).on('change', reportChange);
    gulp.watch([htmlSrc], ['build-html']).on('change', reportChange);

    gulp.watch([fontsSrc], ['copy-fonts']).on('change', reportChange);
    gulp.watch([staticSrc], ['copy-static']).on('change', reportChange);
    gulp.watch([dataSrc], ['copy-data']).on('change', reportChange);
    gulp.watch([cssSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([jsSrc], ['copy-js']).on('change', reportChange);

});

gulp.task('dist', ['default', 'minify']);