# My Gulp Set-up

This project is using [Sass][] and [Gulp][].

## Installation

If you haven't already done so, install [Sass][] and [Gulp][] as they are __required__ for this project.

Ensure that you have dependencies such as [Node][] installed as well.

Navigate to your project folder in the terminal and run "npm install" which will install the Gulp plugins listed in the package.json and you're ready to go.

## Details

Gulp has been configured to do the following:

- Compile Sass to CSS
- Auto-prefix CSS (write W3C syntax, vendor prefixes added automagically)
- Minify CSS
- Concatenate CSS files in plugins folder to a single plugins CSS file
- Concatenate JS files into a single app.js
- Concatenate JS files in plugins folder to a single plugins JS file
- Minify JS
- Run JSHint
- Add a banner to the top of the files with the author, version and build date
- Compress images
- Live updates & remote inspection with BrowserSync
- Notifications on task completion

[Sass]: http://sass-lang.com/
[Gulp]: http://gulpjs.com/
[Node]: http://nodejs.org/