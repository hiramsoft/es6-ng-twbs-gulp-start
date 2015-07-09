ECMAScript 6 + AngularJS + Twitter Bootstrap + JSPM + Jekyll Starter
===============

Take advantage of ES6 and AngularJS today.

This project is a boilerplate to start out making your new web project (single page app, blog, or whatnot)
without having to remember or re-figure out how to get ES6 and AngularJS 1.x to play well together.

It also includes support for compiling **[Jekyll](http://jekyllrb.com/)-like blogs** using only Gulp.  (Feature creep, anyone?)

This project is pre-configured so you can hit the ground running using the following setup:

* ES6 provided by [JSPM](http://jspm.io)
* [AngularJS 1.X](https://angularjs.org/) (latest)
* [Angular UI Router](https://github.com/angular-ui/ui-router) (the superior router)
* [Twitter Bootstrap 3.X](http://getbootstrap.com/)
* [MomentJS](http://momentjs.com/) (the only way to do date and time manipulation)
* [Hiram ES6 Logger](https://github.com/hiramsoft/es6-logger) (make $log available in your code with imports)
* [Swig templates](http://paularmstrong.github.io/Swig/)
     * Note! Variables are defined by `%{{` and `}}%` so Swig and angular can work together
* [Marked](https://github.com/chjj/marked) (markdown support)
* [Gulp](http://gulpjs.com/) (how to build)

Get started
========

1. Clone or download this repository.
2. I expect you to delete most of the content in src, especially the blog.  This site is a [Duck](http://blog.codinghorror.com/new-programming-jargon/).

Demo
========

**[Live Demo on Hiram Software](https://www.hiramsoftware.com/es6-starter/index.html)**

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

How to Develop (and see a local demo)
=======
1. `npm install`
2. `jspm install`
3. `gulp serve`
4. fire up your favorite browser and go to [http://localhost:8080](http://localhost:8080)

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
* *src/main/markdown* - Where markdown files go. The gulp file switches paths around so the pipeline thinks the files are in HTML
* *src/main/generated* - Where HTML templates go that the gulp file uses to generate other files.  Used for generating index files, for example.
* *dist/* - Where your code gets built.
* *target/* - Some tasks require intermediate output, and they get put here.
* *package.json* - JSPM package definition
* *config.js* - JSPM configuration script

Note that the JavaScript and Style files are grouped into bundles, whose paths are available as Swig template variables.

For example, if you have a JavaScript bundle called "myapp", there will be a Swig variable %{{ jsmyapp }}%
that resolves to the relative path of the built JavaScript file.  Note the "js" prefix for javascript,
and there is a "css" prefix for style bundles.

The Gulpfile
=======
The gulpfile is a work in progress.  I am conscious about its length, and have a desire to split it up.

Currently the file is broken into three broad parts:

1. Configuration
    1. Where you configure bundles of JavaScript and CSS to be produced.
    2. You also can change paths and formatting.
2. Gulp Tasks
    1. There are porcelain tasks such as *build*, *clean*, *serve*, and *dist*
3. Pipeline implementation for Jekyll-like behavior
    1. Supporting the Jekyll features required writing new pipeline implementations.
    2. Supports passing through the files twice, once to create an index, and the second to compile.
    3. Supports generating files based on the "generated" folder to create index files and category files.


At Hiram Software we use this gulpfile in other projects (we copy-paste it as needed),
and that behavior is what has added friction to splitting the file up.

Important Note on Markdown Folder
=======

The gulp file will compile files in the markdown folder using similar logic as [Jekyll](http://jekyllrb.com/).
When combined with generated files in the generated folder, you can use this as a drop-in replacement for Jekyll.

The gulp file rewrites the [Vinyl](https://github.com/wearefractal/vinyl) file objects so that the markdown files appear as if they are in the HTML folder.
We do this so the Swig templates work as expected, should you put Swig variables inside your markdown.

Front Matter variables
-----

You may use front matter.  The gulp file treats the following specially, but any variable defined in front matter
will be available as Swig variables (i.e. `%{{ myVariable }}%` )

* **layout**: If present, the markdown file will be wrapped by the following Swig tag.
    * Note that layoutDir is defined in the gulp file so it can resolve the path.
    
        {% extends '$layoutDir/$layout %}
        {% block content %}
        [markdown content goes here]
        {% endblock %}
* **published**: If present and set to YAML false, the file is skipped
* **date**: If present, parsed as a `moment("YYYY-MM-DD")` or `moment("YYYY-MM-DD HH:mm")`.
* **slug** or **permalink**: If present, used to form the target filename.
    * Does not accept variables, used literally for just this file.
    * Can use with paths, i.e. slug = best-of/my-favorite-blog-post
* **categories**: If present, used to populate the categories of the post.
    * If it is a YAML list, each item is treated as a separate category.  Use a YAML list if your categories have spaces.
    * If it is a string, the value is split by whitespace and each word is a separate category.
    * Category names are not yet normalized (i.e. all lowercase, etc).
* **category**: If present, the whole string is assumed to be one category.  May be used in conjunction with categories.
* **tags**: Similar to categories, but collected into a "tags" variable.
* **tag**: Similar to category, but collected into a "tags" variable.

The following variables are computed and available within the Swig template:

* **displayDate**: If the date could be computed, this is a string formatted so you may put it in a byline.
* **year**: If the date could be computed, this will have the year
* **month**: If the date could be computed, this will have the month
* **day**: If the date could be computed, this will have the day
* **url**: The page's relative URL.  Safe for putting within HREFs.

Relative Path Helpers
-----

One important difference with Jekyll is that all paths are relative.
This is by design, and a "Good Thing" described below in the design decisions.

All pages have available a Swig variable called "site" that includes global settings across the site and is recalculated per page.

In particular, there are methods to be aware of that are designed for use in HREFs and SRCs:

1. site.relpath(absurl): Given an absolute path suche as "/blog/" will compute the relative path i.e. "../../blog/"
2. site.docpath(absurl): Same as relpath, but additionally assume there is an html document in the path and will add "index.html" as needed.
3. site.postpath(slug): Given a slug of a markdown post, compute the relative path to it.


Say for example, you have a blog post that after applying the slug will be at `/2000/01/01/y2k-is-here.html`.
You would like a link back to the blog index, located at "/index.html".
Rather than use an absolute path, you can use the array in a Swig expression `href="%{{site.docpath("/")}}%"`
to provide the relative path (in this case "../../../index.html").
Web browsers can handle absolute and relative paths with similar ease.  Your users won't see the difference.

Let's say you want a direct link to the y2k blog post from anywhere on your site.  You would use the Swig expression
`href="%{{site.postpath("y2k-is-here")}}%"`.

In markdown there are shorthand available to avoid dealing with swig directly:
 
1. url:absurl -> site.relpath(absurl)
2. doc:absurl -> site.docpath(absurl)
3. post:slug -> site.postpath(slug)

You can safely put these expressions within markdown links such as
    
    [My link to my favorite blog post](post:y2k-is-here)
    
Isn't that much easier than the alternatives?

A note about filenames
-----

Following the Jekyll convention, the gulp file will check if the filename starts with a date ("YYYY-MM-DD").
If so, and if the front-matter is missing a valid date, the gulp file will use the date from the URL.
The gulpfile then populates `displayDate`, etc, with values based on the computed date.

    There is a function calcSlug() in the gulpfile you can use to calculate your own default logic.
    The current default is to replicate the default jekyll behavior.

A note on the \_posts folder
-----

Within the markdown directory only, gulp will process files in folders starting with a "\_"
but will assume the files are actually located in parent of the "\_" folder.

For example, if you have a "`blog/\_posts/legacy-posts/my-blog-article.md`",
gulp will process the file like
`blog/my-blog-article.md`.

The reason is that in practice most people use either the permalink (or slug) variable or the default slug definition
to set the final path of "my-blog-article.md" and prefer to keep the organization within "\_posts" to be private.


Working examples are within the blog folder
-----

I've tried to include multiple examples within the "blog" to showcase different approaches and interactions
between Gulp, Swig, and Markdown.

Generated folder
======

The basic premise of the "generated" folder is to use each html file as a template to generate other HTML files.

For example, say you want to create a paged listing of blog postings with filenames "index.html", "index-1.html", etc.

You would create a template of the HTML inside the generated folder, placed within the subdirectory of your choosing.

Gulp uses the front matter to figure out what to generate.
Gulp rewrites the path so the pipeline believes the file is actually in the HTML folder.
One consequence of this is that you cannot use Swig to reference other generated files, but Swig can reference
layouts and other HTML files that are defined in the HTML folder.

Front matter used to generate files
-----

Just like markdown, the front matter variables are available as Swig variables.
There are three special-case values of front-matter variables:

* **collection**: The name of an attribute that is located on the site (technically siteContext) object.  Common ones:
    * postPages: An array of pages, each page having at most a configured number of posts.  Most recent posts first.  Useful for generating the index.  $key is the zero-based index.
    * categories: An array of categories, where each category has an array of posts. $key is the categoryName.
    * tags: An array of tags, where each category has an array of posts. $key is the tagName.
    * files: An array of all non-generated files.
* **filename0**: If present, the pattern to use for the first filename.
* **filename**: *Required*: The pattern of the generated filename.  Use `$key` to stand in for the instance's key, i.e. "index-$key.html"

Within the Swig template there are variables that now become available:

* **collection**: The array or collection values.  If you used postPages, this would be all the posts on a paricular page.
* **collectionKey**: The current key
* **collectionI**: The zero-based index of the current collection.
* **keys**: An array of all keys for this collection
* **nextKey**: The next key in the collection (basically keys[collectionI + 1]). Null at boundary.
* **prevKey**: The prev key in the collection (basically keys[collectionI - 1]). Null at boundary.
* **nextFilename**: The next filename, intended to put in a "next" link.  Null at boundary.
* **prevFilename**: The prev filename, intended to put in a "prev" link.  Null at boundary.

How to build for Production
======

1. `gulp dist`
    1. Uglifies javascript and css
    2. Alternatively, `gulp serve-prod` to test out the build with minfied sources
2. Copy the contents of dist to your favorite static site hoster

Behind the scenes, gulp is following the instructions from [JSPM](http://jspm.io).  As of Q2 2015, it looks something like this:

1. Run `jspm bundle-sfx app/bootstrap`
2. Run a bunch of gulp plugins to compile the less, sass, html, Swig templates, etc
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
* "How do I write longform content using markdown and still integrate into my ES6 and AngularJS static site?"

Jekyll-like behavior background
=======

In the beginning this project only compiled HTML, JavaScript, and CSS to demonstrate how to use AngularJS with ES6.

We used this starter project at [Hiram Software](https://www.hiramsoftware.com) for 6 months with a variety of projects.
Eventually we got to the point of wanting to write some content in markdown and publishing to HTML.
The first set of changes were mild, but then we eventually got to Jekyll:

1. We added a new "markdown" folder, which then used [marked](https://github.com/chjj/marked)
2. But, alas, it's not enough to compile markdown.  The markdown is the body, and we want it to appear within our Swig layouts.  We added support for setting the layout variable.
3. This is great, but how do we generate the HREFs and SRCs to get style and scripts in these guides?  We added the relative path support.
4. Ok, it would be great if a guide could have a consistent table of contents on each file. How do we generate TOCs on each file?  How do we generate index files?  We added generated file support.
5. Wow, this is so close to what Jekyll does.  So we added a few final features like the slug and built out a sample blog site.

Why don't we split the Jekyll features from the ES6 features?
The short answer is I agree with the principle, but I don't yet see a clear line to do so.
Another way to put it, the Jekyll features are a superset of compiling ES6 for AngularJS.
If there were a way to package up just the gulp file and release that, then I could see splitting this starter
into two demos -- one for AngularJS and the other for Jekyll.

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

Blog Paths are Relative
--------

Within the generated and markdown folders, whenever a path is calculated, we do so using relative paths.  This is a feature.

The primary reason for this is you never know what will be the parent of static site.
You can't guarantee it will be hosted on the root directory "forever."

Using relative paths enables two scenarios.  First, it enables you generate a portion of your overall site without having
a dependency elsewhere.  If you want to use this build only the "docs" folder, you can do so knowing that there will not
be inadvertant links to the root folder.

Second, if you are like me, you may want to archive content a few years after it is no longer actively maintained.
I typically copy the static site into a sub directory of an archive site.
It sure is a pain when I realize the site has absolute URLs.  The [Hiram Pages Bridge](https://github.com/hiramsoft/hp-bridge) has a similar pain.
Using relative paths enables archiving without making any changes.

Bootstrap vs Foundation
--------

I picked Bootstrap because it is more popular, but I gladly use both for different projects.
[Hiram Software](https://www.hiramsoftware.com) uses Foundation, but [One Step Bingo Card Creator](https://www.hiramsoftware.com/os-bingo-card-creator/) uses Bootstrap.

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

**Gulp vs metalsmith**

I really like [metalsmith](http://www.metalsmith.io/) and have used it elsewhere.
That said, I like the idea of having one build script more than I like trying to put two conceptual models together.
There are projects like [gulpsmith](https://github.com/pjeby/gulpsmith) to help, but I view those as stop-gaps during
transitions.  Since this is a new project, there doesn't seem to be a reason to be in transition.

Further, after battling with the confusing documentation on streams, I eventually discovered how to insert "fake" Vinyl
files into the stream and create generated content.  This obviated any need to metalsmith.

If you are curious, the NodeJS documentation assumes you want to implement a Stream interface and not necessarily
consume the interface.  In practice with pipe() you are consuming the interface.  There also isn't clear documentation
on how to signal the end of a stream -- the answer is `this.push(null)` and not `this.emit('end')`.

**Gulp vs Unknown**

I don't know what I don't know.  I know Gulp.

Todos
=====

Some known issues and features:

1. I'm uncomfortable how this gulpfile has become the kitchen sink.  In many ways it has been the focus of the project even though the original motivation is ES6 and AngularJS.
2. The relative paths are quirky because nodejs path is quirky.  I expect bugs on the margin.