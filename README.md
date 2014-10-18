# My Gulp Set-up

This project is using [Bundler][], [Sass][] and [Gulp][].

## Installation

If you haven't already done so, install [Bundler][], [Sass][] and [Gulp][] as they are __required__ for this project.

Ensure that you have dependencies such as [Ruby][] and [Node][] installed as well.

Navigate to your project folder in the terminal and run "npm install" which will install the Gulp plugins listed in the package.json and you're ready to go.

## Details

Gulp has been configured to do the following:

- Compile Sass to CSS
- Auto-prefix CSS (write W3C syntax, vendor prefixes added automagically)
- Minify CSS
- Concatenate JS files into a single app.js
- Concatenate JS files in plugins folder to a single plugins JS file
- Minify JS
- Run JSHint
- Add a banner to the top of the files with the author, version and build date
- Compress images (currently disabled)
- Live updates with BrowserSync
- Notifications on task completion

[Bundler]: http://bundler.io/
[Sass]: http://sass-lang.com/
[Gulp]: http://gulpjs.com/
[Ruby]: https://www.ruby-lang.org/en/
[Node]: http://nodejs.org/