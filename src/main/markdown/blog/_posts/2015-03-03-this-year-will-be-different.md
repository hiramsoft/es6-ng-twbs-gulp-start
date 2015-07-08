---
layout: post
title: New resolutions for 2015
categories: zombies
published: true
---

I have a *new* resolution.  This year will be different!  I can't be the only one...

Use post:\[permalink\] to link between pages
---------

For example, if you type `post : zombie-ninjas-attack-a-survivors-retrospective` (without the spaces), Gulp will automatically
resolve as:
    
    URL: post:zombie-ninjas-attack-a-survivors-retrospective

Which you can use within links, like the link to the [first post](post:zombie-ninjas-attack-a-survivors-retrospective)
where you may find more examples.

Under the covers this gets converted to the Swig variable: `% { { site.postpath("zombie-ninjas-attack-a-survivors-retrospective") } }%`

Use url:\[abspath\] to link to html files and static assets
--------

Similarly, to resolve an absolute url use `url : /img/350x150.png` (without the spaces) which you may use inside images:

    URL: url:/img/350x150.png

![Placeholder image](url:/img/350x150.png)

Under the covers this gets converted to the Swig variable: `% { {site.relpath("/img/350x150.png") } } %`

*To get the examples to appear on this page, extra spaces are added.*

It is better to be explicit with paths
--------

Prefer /blog/index.html over /blog or /blog/.

<!-- more -->

Break after More
---------

Notice how this site is generated using [Gulp](http://gulpjs.com/) alone, and all paths are relative...

You can safely generate content under your "/blog" directory without having to set a base url.