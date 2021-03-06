const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const del = require('del');
const runSequence = require('run-sequence');
const replace = require('gulp-replace');
const injectPartials = require('gulp-inject-partials');
const inject = require('gulp-inject');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const htmlBeautify = require('gulp-html-beautify');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        port: 8000,
        server: './',
        ghostMode: false,
        notify: false,
    });

    gulp.watch('scss/**/*.scss', ['sass']);
    gulp.watch('pages/**/*.html').on('change', browserSync.reload);
    gulp.watch('js/**/*.js').on('change', browserSync.reload);
});


// Static Server without watching scss files
gulp.task('serve:lite', function() {

    browserSync.init({
        port: 8000,
        server: './',
        ghostMode: false,
        notify: false,
    });

    gulp.watch('**/*.css').on('change', browserSync.reload);
    gulp.watch('pages/**/*.html').on('change', browserSync.reload);
    gulp.watch('js/**/*.js').on('change', browserSync.reload);
});

gulp.task('sass', function() {
    return gulp.src('./scss/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ouputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream())
});

gulp.task('sass:watch', function() {
   gulp.watch('./scss/**/*.scss');
});

/*sequence for injecting partials and replacing paths*/
gulp.task('inject', function() {
   runSequence(
       'injectPartial',
       'injectCommonAssets',
       'replacePath',
       'htmlBeautify',
   );
});


/* inject partials like sidebar and navbar */
gulp.task('injectPartial', function () {
    return gulp.src('./**/*.html', { base: './' })
        .pipe(injectPartials())
        .pipe(gulp.dest('.'));
});

/* inject Js and CCS assets into HTML */
gulp.task('injectCommonAssets', function() {
   return gulp.src('./**/*.html')
       .pipe(inject(gulp.src([
           './vendors/js/vendor.bundle.base.js',
       ], {read: false}), {name: 'plugins', relative: true}))
       .pipe(inject(gulp.src([
           './css/*.css',
           './js/modal.js',
       ], {read: false}), { relative: true }))
       .pipe(gulp.dest('.'));
});

/*replace image path and linking after injection*/
gulp.task('replacePath', function(){
    gulp.src(['./pages/**/*.html'], { base: "./" })
        .pipe(replace('src="images/', 'src="../../images/'))
        .pipe(replace('src="../images/', 'src="../../images/'))
        .pipe(gulp.dest('.'));
});

gulp.task('htmlBeautify', function() {
   gulp.src(['./**/*.html'])
       .pipe(htmlBeautify())
       .pipe(gulp.dest('.'))
});

/*sequence for building vendor scripts and styles*/
gulp.task('bundleVendors', function() {
    runSequence(
        'clean:vendors',
        'buildBaseVendorScripts',
    );
});

gulp.task('clean:vendors', function() {
    return del([
        'vendors/**/*'
    ]);
});

/*Building vendor scripts needed for basic template rendering*/
gulp.task('buildBaseVendorScripts', function() {
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/popper.js/dist/umd/popper.min.js',
        './node_modules/bootstrap/dist/js/bootstrap.min.js',
    ])
        .pipe(concat('vendor.bundle.base.js'))
        .pipe(gulp.dest('./vendors/js'));
});

/*Set default task for gulp*/
gulp.task('default', ['serve']);
