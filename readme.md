ECMAScript 6 + AngularJS + Twitter Bootstrap + JSPM Starter
===============

Take advantage of ES6 and AngularJS today.

This project is a boilerplate to start out making your new web project (single page app or not)
without having to remember or re-figure out how to get ES6 and AngularJS 1.x to play well together.

This project is pre-configured so you can hit the ground running using the following setup:

* ES6 provided by [JSPM](http://jspm.io)
* [AngularJS 1.X](https://angularjs.org/) (latest)
* [Angular UI Router](https://github.com/angular-ui/ui-router) (the superior router)
* [Twitter Bootstrap 3.X](http://getbootstrap.com/)
* [MomentJS](http://momentjs.com/) (the only way to do date and time manipulation)
* [Hiram ES6 Logger](https://github.com/hiramsoft/es6-logger) (make $log available in your code with imports)
* [Swig templates](http://paularmstrong.github.io/swig/)
     * Note! Variables are defined by `%{{` and `}}%` so swig and angular can work together 
* [Gulp](http://gulpjs.com/) (how to build)

Get started
========

1. Clone or download this repository.

Notes for experienced people
---------

1. strictDi: true
2. config.js already has the global export for angular
3. This uses [babel](https://babeljs.io/) because of jspm defaults
4. Built via [gulp](http://gulpjs.com/) and a few plugins
    1. SASS, LESS
    2. jspm to do packaging
    3. Swig templates
5. Be wary about updating Babel or JSPM... there have been build breaks when naively updating to the latest.

Orientation
=====
Brief overview of the important files.  The actual starter files are located within the 'src/main' subdirectory
since there seems to be an absence of a convention for web development, and picking maven-style is probably not
the worst thing.  It also is at least a standard that should remove cognitive load.  That said, 'dist' is very much
a common convention and that is the output directory over 'target.'  If you want target, there is a place inside
the gulpfile.js to change it.

General overview:

* *src/main/es6* - Where the ES6 JavaScript lives
    * */bootstrap.js* - Entry point for the application
    * */ng-app.js* - Top level "module" that would be initialized by ng-app.
    * */router.js* - Top-level Angular-UI router
    * */controllers.js* - Place to register controllers.
    * */services.js* - Place to register your services.
    * */directives.js* - Place to register your directives.
    * */filters.js* - Place to register your filters.
    * */vendor/* - Place to put 'vendor' code that isn't practical to be managed by jspm.
* *src/main/js* - Where your ES5 JavaScript lives.
* *src/main/html* - Where your HTML templates live.
* *src/main/less* - Where the LESS templates are.
* *src/main/static* - Where static items to copy verbatim, like images, should go.
* *dist/* - Where your code gets built.
* *target/* - Some tasks require intermediate output, and they get put here.
* *package.json* - JSPM package definition
* *config.js* - JSPM configuration script


How to Develop
=======
1. `npm install`
2. `jspm install`
3. `gulp serve`
4. fire up your favorite browser and go to [http://localhost:8080](http://localhost:8080)

How to build for Production
======

1. `gulp dist`
    1. Uglifies javascript and css
    2. Alternatively, `gulp serve-prod` to test out the build with minfied sources
2. Copy the contents of dist to your favorite static site hoster

Behind the scenes, gulp is following the instructions from [JSPM](http://jspm.io).  As of Q2 2015, it looks something like this:

1. Run `jspm bundle-sfx app/bootstrap`
2. Run a bunch of gulp plugins to compile the less, sass, html, swig templates, etc
3. Change the includes on index.html to the resulting 'build.js' file

Why does this exist?
======

We are in a transition period between the _"old"_ way of using AngularJS with dependency injection
and the _"new"_ ES6 style of imports and separate files.

In general, I love the direction of ES6 and would advocate to most to give it a try.

However, you have to figure out the arcane intricacies of AngularJS (especially the bootstrap mechanism) to get
JSPM's ES6 and AngularJS 1.X to work together.  This starter is designed to show you how with a complete example
that shows one way of separating your code into multiple files that handle a real-world dependency.

When I came across this problem, I saw some partial solutions but I hadn't found anyone else that solved all
of the issues at once:

* "How do I separate my code into as many smaller files as possible?"
* "How do I handle dependencies provided by JSPM in AngularJS?"
* "How do I write services as ES6 classes?"
* "How do break my controllers up into multiple files?"
* "How do I register directives?"
* "How do I separate my router logic from the top-level app?"
* "How do I build and deploy my JS, CSS, and HTML?"
* "How do I use libraries that are not yet ready for ES6?"

Design decisions
==========

Some of the decisions behind this project are different than what you may have seen or would prefer.

Directory layout
---------

This is a contentious topic.  The project uses the [Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html). 

* "What is this directory layout?"
* "Why is everything buried in src/main/... it *should* be app/... or lib/...".
* "I hate Maven"
* "ReactJS does it *this* way."

I wish I could have taken a popular JavaScript directory convention and used it here.  I tried, but the devil is always in the details.
The short answer is there does not yet exist a standard way to place and organize JavaScript files.
At some point it may exist in the future, but in 2015 there is not yet one.

The fundamental issue is that while each type of file gets copied or compiled differently there isn't a good way to tell these files apart using filenames alone.

Take for example, three files.

* my-es6-source.js
* my-es5-legacy-source.js
* my-vendor-library.min.js

Each of these files has a "js" extension, so we can treat them all as JavaScript, right?

Well, not exactly.  The first file is actually ES6.  And for the time being we need to transpile (or compile) the ES6 code down to ES5.  This file gets treated WAY 1.

The second file is existing ES5 JS code that I wrote and want to minified.  I may also want it concatenated with my ES6 code.  This file gets treated WAY 2.

The third file was provided by a vendor, and since I don't trust using CDNs, I plan to host the file myself.  Since the file is
already minified, and because of bad experiences running Babel over it, I want that vendor library file copied verbatim.  This file gets treated WAY 3.

How can you map using filenames alone the expected outcomes of WAY 1, WAY 2, and WAY 3?

The same problem exists for LESS and SCSS files.  Typically there is just one entry point that then includes or imports other LESS or SCSS files.
How does the build process know which file to start with?  I typically want one CSS file, not a bunch of CSS files.  Some build defaults, for example, are to concatenate everything.  Concatenating is redundant with including.  

HTML is also affected.  Sometimes you want to use templates, to include common headers or footers.
You don't want to copy the underlying header or footer parts to the dist folder, do you?
You can't just copy all .HTML files verbatim.

This is not the first time in computing history we've come across the problem of how to build different types of source code.
Reaching into the bag of collective experience, Maven offered a good-enough and well-known solution:

    Group code that is built the same way into folders. e.g. all Java code goes in "java", Scala code goes in "scala", etc.

Please underline the "well-known" as that is very important to this project.
    
Maven suggests the following:

* [basedir]/js/...
* [basedir]/less/...
* [basedir]/coffee/...

The question then is what to use as the base directory?  My first instinct was to borrow the "app" folder that
is common in ReactJS among other places.  I would then have to explain how this starter uses a mixture of Maven and ReactJS.

Instead, I chose to adopt the Standard Directory Layout wholeheartedly.

There are three reasons:

* Grouping code that gets built the same way into common folders can be generalized based on Maven's wisdom. Within these folders you can have an organization that makes sense to you.
    * Would I love to put related partial templates with controller JS code?  Absolutely.  I've never seen it work in large codebases, though.
* "This is the Standard Directory Layout" has less cognitive load than "This is *like* the Standard Directory Layout"
    * "What does *like* mean?" "In what ways is it different?"  And then for each difference, "Why did you choose *that*? I would have done *this*!"
    * The Standard Directory Layout is well known, arguably better known than the "app" convention, which means this codebase should be more approachable.
* Where do you put tests?  Just as there is no convention on where to put source code, there is similarly no convention on where to put tests.  Maven gives us an answer.

Bootstrap vs Foundation
--------

I picked Bootstrap because it is more popular, but I gladly use both for different projects.
[Hiram Software](https://www.hiramsoftware.com) uses Foundation, but [One Step Bingo Card Creator](https://www.hiramsoftware.com/open-bingo) uses Bootstrap.

Foundation is present in the build, just not "enabled."  The Bootstrap styles and fonts are in LESS,
and the Foundation styles are in SCSS, based on each project's respective decisions.  When you build this starter,
you are compiling each's source LESS and SCSS to get your own, custom minified css.

By default the Bootstrap JavaScript is included using jspm.  If you preferred Foundation, then jspm install foundation
and delete Bootstrap.  That's it!

Gulp vs Grunt vs Broccoli vs Brunch vs Unknown
---------

This project uses [Gulp](http://gulpjs.com/).  You may have experience or preference using another build tool.
As a starter project, the goal is to show a complete working example.
One of the consequences of this is picking a build tool.  Here's some rough thinking behind this.

**Gulp vs Grunt**

You've heard of [Grunt](http://gruntjs.com/).  We all have.

For the rest of the project I used popularity as a rough guide to help pick.  Why?
I want this starter to be as accessible as possible. AngularJS 1.X may have issues, but it is popular.
Bootstrap may be worse than XYZ, but it is popular.  Grunt, as far as I know, is the most popular build tool, but this
project uses Gulp.

Why?

In my experience, Gulp is noticeably "faster" than Grunt, and I find I enjoy maintaining gulp tasks.
Call it preference, bias, naivete -- Gulp feels like the more maintainable of the two.

**Gulp vs Broccoli**

I'm unfamiliar with [Broccoli](http://broccolijs.com/), and I've never seen it in the wild.  The project looks like a credible alternative.

**Gulp vs Brunch**

I'm unfamiliar with [Brunch](http://brunch.io/), but the conventions it chose on the surface seem to clash with this project.
For example, "JS files will be automatically concatenated."  I don't want source ES6 files with ".js" extensions to be concatenated.
I want JSPM and Babel to compile them.  I could see concatenating the build.js file with other JS files, but where does build.js go?
I'm sure there is a way around this, but given Brunch is much less popular
I withdrew consideration based on the expected the learning curve.


**Gulp vs Unknown**

I don't know what I don't know.  I know Gulp.