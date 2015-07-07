/**
 *      ES6-AngularJS-TwitterBootstrap-Gulp Starter
 *      Copyright 2014-2015 Hiram Software
 *      See https://github.com/hiramsoft/es6-ng-twbs-gulp-start for more information
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
var _ = require('lodash');
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
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var revision = require('git-rev');
var swig = require('gulp-swig');
var gls = require('gulp-live-server');
var concatCss = require('gulp-concat-css');
var sizereport = require('gulp-sizereport');
var frontMatter = require('gulp-front-matter');
var marked = require('marked');
var markedTransform = require('gulp-marked').fileTransform;
var through = require('through2');
var insert = require('gulp-insert');


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
var layoutDir = "_layout";

var htmlSrc = ['!' + baseMainPath + '/html/{' + layoutDir + ',' + layoutDir + '/**}', baseMainPath + '/html/**/*.html'];
var htmlDest = baseDestPath;

var mdSrc = [baseMainPath + "/markdown/**/*.md", baseMainPath + "/markdown/**/*.markdown"];
var mdDest = baseDestPath;

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
//////// HTML and Markdown Helpers
////////////////////////////////////////

/**
 * Credit: gulp-replace
 */
function parsePath(p) {
    var extname = path.extname(p);
    return {
        dirname: path.dirname(p),
        basename: path.basename(p, extname),
        extname: extname
    };
}

/**
 * Given output from marked and frontMatter,
 *  - pretend that the file is an HTML file in $htmlSrc (rewrite $file.path)
 *  - render the HTML using marked (either in streaming or buffer mode)
 *  - wrap the file contents in {% extends $frontMatter.layout %} {% block contents %} $file.contents {% endblock %}
 */
function applyMarkdownAndSwig(layoutDir) {
    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            return cb(null, file);
        }

        if (!file.frontMatter || !file.frontMatter.layout || file.frontMatter.layout.length == 0) {
            return cb(null, file);
        }

        // firstly, to be compatible with gulp-data, merge front-matter into data attribute
        // so variables can be referenced from within the swig template
        file.data = file.data || {};
        file.data = _.merge(file.data, file.frontMatter);

        var parsedPath = parsePath(file.path);

        // For swig to work, we need to make it look like the reslting HTML is inside the HTML directory
        parsedPath.dirname = parsedPath.dirname.replace("/markdown/", "/html/");
        file.base = file.base.replace("/markdown/", "/html/");

        // Allow users to set the slug (i.e. the url) via the front-matter
        if(file.data.slug && file.data.slug.length > 0){
            var slug = path.basename(file.data.slug);
            parsedPath.basename = slug;
            file.data.slug = slug + ".html";
        } else {
            // TODO: Add in a hook to calculate the slug using something :)
        }

        file.path = path.join(parsedPath.dirname, parsedPath.basename + ".html");

        var layout = file.data.layout;
        if(layoutDir){
            var resolvedDir = path.resolve(path.dirname(file.path), path.join(file.base, layoutDir));
            layout = path.join(resolvedDir, layout);
        }

        if(path.extname(layout) != ".html"){
            layout = layout + ".html";
        }

        var prepend = "{% extends '" + layout + "' %}\n\n{% block content %}\n";
        var append = "\n{% endblock %}";

        if (file.isStream()) {
            // And we want swig to think the HTML is part of a layout
            file.contents = file.contents
                .pipe(markerTransform({}))
                .pipe(insert.wrap(prepend,append))
            ;

            return cb(null, file);
        }

        if (file.isBuffer()) {
            marked(String(file.contents), function(err, content){
                if(err){
                    cb(err);
                } else {
                    var str = prepend + String(content) + append;
                    file.contents = new Buffer(str);
                    cb(null, file);
                }
            })
        }
    })
};

/**
 *  Adds in revision information to the file.data object
 *  so it may be used by swig
 */
function addRevSettings(){
    return through.obj(function (file, enc, cb) {
        var gitInfo = {
            short: "Development",
            branch: "master"
        };
        revision.short(function (str) {
            gitInfo.short = str;
            revision.branch(function (str) {
                gitInfo.branch = str;

                var relPath = path.relative(path.dirname(file.path), file.base);

                file.data = file.data || {};
                file.data.css = path.join(relPath, cssBasename + ".css");
                file.data.gitRevShort = gitInfo.short;
                file.data.gitBranch = gitInfo.branch;

                for (var i in jspmBundleSfx) {
                    var jspm = jspmBundleSfx[i];
                    file.data['js' + jspm.id] = path.join(relPath, jspm.out);
                }

                cb(null, file);
            })
        });
    });
};

////////////////////////////////////////
//////// Build tasks (i.e. take input files and transform)
////////////////////////////////////////

// Copies *.html files, applies swig templates,
// and makes available variables to populate <script> and <link> tags with production URLs
gulp.task('build-html', function() {
    return gulp.src(htmlSrc)
        .pipe(addRevSettings())
        .pipe(swig({
            defaults: {
                cache: false,
                varControls : ['%{{', '}}%']
            }
        }))
       .pipe(gulp.dest(htmlDest));
});
// Renders
gulp.task('build-markdown', function() {
    return gulp.src(mdSrc)
        .pipe(frontMatter({ // optional configuration
            property: 'frontMatter', // property added to file object
            remove: true // should we remove front-matter header?
        }))
        .pipe(applyMarkdownAndSwig(layoutDir))
        .pipe(addRevSettings())
        .pipe(swig({
            defaults: {
                cache: false,
                varControls: ['%{{', '}}%']
            }
        }))
        .pipe(gulp.dest(mdDest));
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

gulp.task('build', ['bundle-jspm', 'build-less', 'build-scss', 'build-html', 'build-markdown']);

gulp.task('copy', ['copy-fonts', 'copy-static', 'copy-css', 'copy-data', 'copy-js', 'copy-es6']);

gulp.task('watch', ['default'], function() {
    gulp.watch([lessSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([scssSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([es6Src], ['copy-es6']).on('change', reportChange);
    // Note: Markdown depends on the HTML templates, which is why the two are coupled
    gulp.watch([htmlSrc, mdSrc], ['build-html', 'build-markdown']).on('change', reportChange);

    gulp.watch([fontsSrc], ['copy-fonts']).on('change', reportChange);
    gulp.watch([staticSrc], ['copy-static']).on('change', reportChange);
    gulp.watch([dataSrc], ['copy-data']).on('change', reportChange);
    gulp.watch([cssSrc], ['copy-css']).on('change', reportChange);
    gulp.watch([jsSrc], ['copy-js']).on('change', reportChange);

});

gulp.task('dist', ['default', 'minify']);