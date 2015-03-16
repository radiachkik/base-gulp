// Load Gulp and all the plugins
var gulp    = require('gulp'),
concat      = require('gulp-concat'),
uglify      = require('gulp-uglify'),
sourcemaps  = require('gulp-sourcemaps'),
autoprefix  = require('gulp-autoprefixer'),
minifycss   = require('gulp-minify-css'),
header      = require('gulp-header'),
jshint      = require('gulp-jshint'),
notify      = require('gulp-notify'),
rename      = require('gulp-rename'),
filter      = require('gulp-filter'),
changed     = require('gulp-changed'),
sass        = require('gulp-sass'),
imagemin    = require('gulp-imagemin'),
pngquant    = require('imagemin-pngquant'),
mozjpeg     = require('imagemin-mozjpeg'),
browserSync = require('browser-sync'),
reload      = browserSync.reload;

// Set the banner
var pkg    = require('./package.json'),
dateFormat = require('dateformat'),
now        = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss Z"),
banner     = '/*!\n'+
			 ' * <%= pkg.name %>\n'+
			 ' * @author <%= pkg.author %>\n'+
			 ' * @version <%= pkg.version %>\n'+
			 ' * Build date: '+ now +'\n'+
			 ' */\n';

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
	gulp.src('js/src/*.js')
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
	gulp.src('css/**/*.scss')
		.pipe(sourcemaps.init())
			.pipe(sass({
				outputStyle: 'expanded',
				errLogToConsole: false,
				onError: function(err) {
					var splitErrMessage  = err.message.split("\n"),
						errMessageLength = splitErrMessage.length,
						message          =
							"Error compiling Sass." +
							"\n\t   File: " + err.file +
							"\n\t   Line: " + err.line +
							"\n\t   Message: " + splitErrMessage[0]
					;

					// Some errors have a second part
					if(typeof splitErrMessage[1] !== 'undefined') {
						message += "\n\t   " + splitErrMessage[1]
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
				}
			}))
			.pipe(autoprefix())
		.pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '.' }))
		.pipe(gulp.dest('css/'))
		.pipe(filter('*.css')) // Filter stream so we only get notifications and injections from CSS files, not the maps & so we don't minify the map file
		.pipe(rename({ suffix: ".min" })) // Rename the generated CSS file to add the .min suffix
		.pipe(minifycss({ keepSpecialComments: 0 }))
		.pipe(header(banner, { pkg: pkg } ))
		.pipe(gulp.dest('css/'))
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Styles: ' + file.relative + ' generated.';
		}));
});

// Plugin styles task: concatenates & minifies CSS files for plugins
gulp.task('plugin-styles', function() {
	gulp.src('css/plugins/*.css')
		.pipe(concat('plugins.min.css'))
		.pipe(minifycss({ keepSpecialComments: 0 }))
		.pipe(header(banner, { pkg: pkg } ))
		.pipe(gulp.dest('css/'))
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Styles: ' + file.relative + ' generated.';
		}));
});

// Image optimisation task: optimises jpegs and pngs
gulp.task('optimise-images', function () {
	gulp.src('img/src/**/*')
		.pipe(changed('img/build/'))
		.pipe(imagemin({
			progressive: true,
			optimizationLevel: 5,
			use: [pngquant({ quality: '60-80' }), mozjpeg()]
		}))
		.pipe(gulp.dest('img/build/'));
});

gulp.task('generate-webp-images', function () {
	gulp.src('img/src/**/*.jpg') // We'll only use it for jpegs since we get better results using pngquant above for pngs
		.pipe(changed('img/build/', { extension: '.webp' }))
		.pipe(webp({ quality: 83 })) // I think default quality is 75 which is a bit too low (especially for use in some PNGs)
		.pipe(gulp.dest('img/build/'));
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