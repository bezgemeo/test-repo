'use strict';

var gulp = require('gulp'),
    // watch       = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    // less         = require('gulp-less'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

sass.compiler = require('node-sass');


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'dist/',
        js: 'dist/js/',
        php: 'dist/php/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'app/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/*.js',//В стилях и скриптах нам понадобятся только main файлы
        php: 'app/php/*.php', //php files
        style: 'app/scss/*.scss',
        fullCss: 'app/scss/fullCss',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/scss/**/*.scss',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './dist'
};

var config = {
    server: {
        baseDir: "./dist",
        index: 'index.html'
    },
    tunnel: true,
    host: 'localhost',
    port: 3000
};

function htmlBuild() {
    return gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger (ищет такие записи в
                        // указанных хтмл файлах '//= templates/footer.html')
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку dist
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
}

function jsBuild() {
    return gulp.src(path.src.js) //Найдем наши js файлы
        .pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
}

function styleBuild() {
    return gulp.src(path.src.style) //Выберем наши файлы стилей
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['> 1%'], cascade: false})) //Добавим вендорные префиксы
        .pipe(gcmq()) //сгруппируем все медиазапросы
        .pipe(gulp.dest(path.src.fullCss))
        .pipe(cssmin({level: 2})) //Сожмем
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
}


function imageBuild() {
    return gulp.src(path.src.img) //Выберем наши картинки
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
}


function fontsBuild() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}

function phpBuild() {
    return gulp.src(path.src.php)
        .pipe(gulp.dest(path.build.php));
}

function imageMin() {
    return gulp.src(path.src.img)
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)); //И бросим в build
    // .pipe(reload({stream: true})); //И перезагрузим сервер
}

gulp.task('build', gulp.parallel(htmlBuild, jsBuild, styleBuild, fontsBuild, phpBuild, imageBuild));
gulp.task('imgmin', imageMin);

function watcher() {
    gulp.watch(path.watch.html, {awaitWriteFinish: true}, htmlBuild);
    gulp.watch(path.watch.style, {awaitWriteFinish: true}, styleBuild);
    gulp.watch(path.watch.js, {awaitWriteFinish: true}, jsBuild);
    gulp.watch(path.watch.fonts, {awaitWriteFinish: true}, fontsBuild);
    gulp.watch(path.watch.php, {awaitWriteFinish: true}, phpBuild);
    gulp.watch(path.watch.img, {awaitWriteFinish: true}, imageBuild);
}

gulp.task('browser-sync', function (cb) {
    browserSync(config, cb);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', gulp.series('browser-sync', watcher));
