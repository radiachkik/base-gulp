# My Gulp Set-up

This project is a default [Gulp][] and [Sass][] configuration that's used as a basis for many projects.

I also have a blog post for a little more info on [this set-up and why I use Gulp](http://williamwalker.me/blog/introducing-gulp.html).

## Installation

If you haven't already done so, install [Gulp][] and [Sass][] as they are __required__ for this project.

Ensure that you have dependencies such as [Node][] installed as well.

Navigate to your project folder in the terminal and run "npm install" which will install the packages listed in the package.json and you're ready to go.

## Details

Gulp has been configured to do the following:

- Compile Sass to CSS
- Auto-prefix CSS (write W3C syntax, vendor prefixes added automagically based on Browserslist config in package.json)
- Minify CSS
- Concatenate JS files into a single app.js
- Transpile JS with [Babel][] (based on Browserslist config in package.json)
- Minify JS
- Run ESLint for linting JS
- Run Stylelint for linting CSS and Sass
- Generates Sourcemaps for CSS and JS
- Live updates & remote inspection with BrowserSync
- Notifications on task completion

[Sass]: http://sass-lang.com/
[Gulp]: http://gulpjs.com/
[Node]: http://nodejs.org/
[Babel]: https://babeljs.io/