var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    notify = require('gulp-notify'),
    smartgrid = require('smart-grid'),
    gcmq = require('gulp-group-css-media-queries'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    babel = require('gulp-babel'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    gulpif = require('gulp-if'),
    sourcemaps = require('gulp-sourcemaps');

let isDev = false
let isProd = !isDev
let isSync = false

const arrayOfJs = ['./source/js/jquery.min.js',
    './source/js/responsiveMenu.js',
    './source/js/scrollTo.js',
    './source/js/owl.carousel.min.js',
    './source/js/responsiveJournal.js',
    './source/js/responsiveTravelDirection.js',
    './source/js/responsiveWorkSchemeSection.js',
    './source/js/responsiveGallery.js'];

gulp.task('styles', function () {
    //return gulp.src('app/sass/*.+(sass|scss)')
    return gulp.src('source/sass/main.scss')
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
        .pipe(gcmq())
        .pipe(gulpif(isProd, autoprefixer({
            overrideBrowserslist: ["last 2 versions"],
            cascade: false
        })))
        .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
        .pipe(gulpif(isDev, sourcemaps.write()))
        .pipe(gulp.dest('dist/css'))
        .pipe(gulpif(isSync, browserSync.reload({ stream: true })))
})

gulp.task('js', function () {
    return gulp.src(arrayOfJs)
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(concat('index.js'))
        .pipe(gulpif(isProd, babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpif(isProd, uglify({ toplevel: true })))
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulpif(isSync, browserSync.stream()))
})

gulp.task('makeSvgSprite', function () {
    return gulp.src('./source/svg/*.svg')
        .pipe(svgmin())
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    dest: '',
                    sprite: 'sprite.svg'
                }
            },
            svg: {
                namespaceClassnames: ''
            }
        }))
        .pipe(gulp.dest('./dist/svgSprite/'))
})

/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1165px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        sec21440: {
            width: '1440px'
        },
        sec21610: {
            width: '1610px'
        },
        lge: {
            width: '1520px'
        },
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px',
            fields: '15px'
        },
        xxs: {
            width: '420px',
            fields: '10px'
        }
    }
};

smartgrid('./source/sass', settings);

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: './dist'
        },
        notify: false
    });
});

gulp.task('html', function () {
    return gulp.src('./source/*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(gulpif(isSync, browserSync.stream()))
})

gulp.task('cleanDist', async function () {
    const deletedPaths = await del(['dist/**', '!dist/imgs', '!dist/fonts']);
    console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
})

function devFlags(done) {
    isSync = true
    isDev = true
    done()
}

function prodFlags(done) {
    isSync = true
    isDev = false
    done()
}

function smallProd(done) {
    isSync = false
    isDev = false
    done()
}

function watcher() {
    gulp.watch('source/sass/**/*.+(sass|scss)', gulp.parallel('styles'))
    gulp.watch('./source/*.html', gulp.parallel('html'))
    gulp.watch('source/js/*.js', gulp.parallel('js'))
}

gulp.task('dev', gulp.series(devFlags, 'makeSvgSprite', 'html', 'styles', 'js', gulp.parallel('browser-sync', watcher)))
gulp.task('build', gulp.series('cleanDist', prodFlags, 'makeSvgSprite', 'html', 'styles', 'js', gulp.parallel('browser-sync', watcher)))
gulp.task('fast', gulp.series('cleanDist', smallProd, 'makeSvgSprite', 'html', 'styles', 'js'))