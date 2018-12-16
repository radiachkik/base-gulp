const { src, dest, watch, series, parallel } = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const notify = require('gulp-notify');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('gulp-stylelint');
// const uglify = require('gulp-uglify');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const cssImport = require('postcss-import');

function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}

function jsLint() {
    return src('js/src/*.js')
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, dest('js/src/')))
        .pipe(eslint.results(results => {
            if (results.errorCount > 0) {
                throw new Error(`ESLint: ${results.length} results, ${results.errorCount} errors, ${results.warningCount} warnings`);
            }
        }))
        .on('error', notify.onError('ESLint: <%= error.message %>'))
        .pipe(eslint.failAfterError());
}

function javascript() {
    return src('js/src/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(babel())
        // .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '/js/src' }))
        .pipe(dest('js/'))
        .pipe(filter('js/*.js')) // Filter stream so we only get notifications from JS files, not the maps
        .pipe(notify('Scripts: <%= file.relative %> generated.'));
}

function cssLint() {
    return src('css/**/*.scss')
        .pipe(stylelint({
            failAfterError: true,
            reporters: [{ formatter: 'string', console: true }],
        }));
}

function css() {
    return src('css/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(postcss([
            cssImport(),
            autoprefixer(),
            cssnano(),
        ]))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '.' }))
        .pipe(dest('css/'))
        .pipe(filter('css/*.css')) // Filter stream so we only get notifications and injections from CSS files, not the maps
        .pipe(browserSync.stream())
        .pipe(notify('Styles: <%= file.relative %> generated.'));
}

function sync(done) {
    // Dynamic proxy configuration
    // browserSync.init({
    //     proxy: 'local.domain.com',
    // });

    // Static configuration
    // browserSync.init({
    //     server: {
    //         baseDir: './',
    //     },
    // });

    done();
}

function reload(done) {
    browserSync.reload();

    done();
}

function watcher() {
    watch('js/src/*.js', series(jsLint, javascript, reload));
    watch('css/**/*.scss', series(cssLint, css));
}

exports.default = parallel(series(jsLint, javascript), series(cssLint, css));
exports.watch = watcher;
exports.css = series(cssLint, css);
exports.js = series(jsLint, javascript);
exports.sync = series(sync, watcher);
