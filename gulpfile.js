// Load Gulp and all the plugins
var pkg     = require('./package.json'),
browserSync = require('browser-sync'),
dateFormat  = require('dateformat'),
reload      = browserSync.reload,
gulp        = require('gulp'),
autoprefix  = require('gulp-autoprefixer'),
concat      = require('gulp-concat'),
cssnano     = require('gulp-cssnano'),
filter      = require('gulp-filter'),
header      = require('gulp-header'),
jshint      = require('gulp-jshint'),
notify      = require('gulp-notify'),
plumber     = require('gulp-plumber'),
rename      = require('gulp-rename'),
sass        = require('gulp-sass'),
sourcemaps  = require('gulp-sourcemaps'),
uglify      = require('gulp-uglify');

// Set the banner
var now = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss Z"),
banner  = '/*!\n'+
		  ' * Build date: '+ now +'\n'+
		  ' */\n';

// Hold the name of the last task to run, in case of error
var taskName;

var handleError = function(err) {
	var file = err.file;
	var line = err.line;

	if(typeof err.file === 'undefined') {
		file = err.fileName;
	}

	if(typeof err.line === 'undefined') {
		line = err.lineNumber;
	}

	var splitErrMessage  = err.message.split("\n"),
		errMessageLength = splitErrMessage.length,
		message          =
			"Error running '" + taskName + "' task." +
			"\n\t   File: " + file +
			"\n\t   Line: " + line +
			"\n\t   Message: " + splitErrMessage[0]
	;

	// Some errors have a second part
	if(typeof splitErrMessage[1] !== 'undefined') {
		message += "\n\t   " + splitErrMessage[1];
	}

	// Some have even more (missing mixin for example where it'll privide a backtrace)
	if(errMessageLength > 2) {
		splitErrMessage.forEach(function(el, i) {
			if(i > 1) {
				message += "\n\t\t" + splitErrMessage[i].trim();
			}
		});
	}

	return notify().write(message);
};

// JS hint task: Runs JSHint using the options in the .jshintrc file
gulp.task('jshint', function() {
	gulp.src('js/src/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(notify(function (file) {
			if (file.jshint.success) {
				return 'JSHint: ' + file.relative + ' (complete).';
			} else {
				return 'JSHint: ' + file.relative + ' (' + file.jshint.results.length + ' errors).';
			}
		}));
});

// Scripts task: Concat, minify & generate sourcemaps
gulp.task('scripts', function() {
	// this.seq is an array containing the tasks that have run, we want that last one
	taskName = this.seq.pop();

	gulp.src('js/src/*.js')
		.pipe(plumber({errorHandler: handleError}))
		.pipe(sourcemaps.init())
			.pipe(concat('app.js'))
			.pipe(header(banner, { pkg: pkg } ))
			.pipe(gulp.dest('js/'))
			.pipe(rename('app.min.js'))
			.pipe(uglify())
			.pipe(header(banner, { pkg: pkg } ))
		.pipe(sourcemaps.write('maps', { includeContent: false, sourceRoot: '/js/src' }))
		.pipe(gulp.dest('js/'))
		.pipe(filter('*.js')) // Filter stream so we only get notifications and reloads from JS files, not the maps
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Scripts: ' + file.relative + ' generated.';
		}));
});

// Plugin scripts task: Concat JS files for plugins
gulp.task('plugin-scripts', function() {
	gulp.src('js/plugins/*.js')
		.pipe(concat('plugins.min.js'))
		.pipe(header(banner, { pkg: pkg } ))
		.pipe(gulp.dest('js/'))
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Scripts: ' + file.relative + ' generated.';
		}));
});

// Styles task: Compile Sass, add prefixes and minify
gulp.task('styles', function() {
	// this.seq is an array containing the tasks that have run, we want that last one
	taskName = this.seq.pop();

	gulp.src('css/**/*.scss')
		.pipe(plumber({errorHandler: handleError}))
		.pipe(sourcemaps.init())
			.pipe(sass({ outputStyle: 'expanded' }))
			.pipe(autoprefix())
			.pipe(gulp.dest('css/'))
			.pipe(rename({ suffix: ".min" })) // Rename the generated CSS file to add the .min suffix
			.pipe(cssnano())
			.pipe(header(banner, { pkg: pkg } ))
		.pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '.' }))
		.pipe(gulp.dest('css/'))
		.pipe(filter('*.css')) // Filter stream so we only get notifications and injections from CSS files, not the maps & so we don't minify the map file
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Styles: ' + file.relative + ' generated.';
		}));
});

// Plugin styles task: concatenates & minifies CSS files for plugins
gulp.task('plugin-styles', function() {
	gulp.src('css/plugins/*.css')
		.pipe(concat('plugins.min.css'))
		.pipe(cssnano())
		.pipe(header(banner, { pkg: pkg } ))
		.pipe(gulp.dest('css/'))
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Styles: ' + file.relative + ' generated.';
		}));
});

// Configure and start BrowserSync
gulp.task('browser-sync', function() {
	browserSync({
		proxy: "local.domain.com"
	});
});

// Standard watch task
gulp.task('watch', function() {
	gulp.watch('js/src/*.js', ['jshint', 'scripts']);
	gulp.watch('js/plugins/*.js', ['plugin-scripts']);
	gulp.watch('css/**/*.scss', ['styles']);
	gulp.watch('css/plugins/*.css', ['plugin-styles']);
});

// Start BrowserSync and watches for changes
gulp.task('watch-and-sync', ['browser-sync', 'watch']);

// Default task: runs tasks immediately and continues watching for changes
gulp.task('default', ['jshint', 'scripts', 'plugin-scripts', 'styles', 'plugin-styles', 'watch']);