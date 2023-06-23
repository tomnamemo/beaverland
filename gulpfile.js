const gulp = require("gulp"),
  fs = require("fs"),
  paths = require("path"),
  cheerio = require("cheerio");
del = require("del");

const port = 8090;
/*=============================
 @Path 정의
 ==============================*/
const src = "./src";
const dist = "./dist";
const path = {
  styles: {
    input: src + "/sass/",
    inputFile: src + "/sass/**/*.scss",
    output: dist + "/css/",
    autoprefixer: dist + "/css/style.css",
  },
  images: {
    input: src + "/images/**/",
    output: dist + "/images/",
    svg: src + "/images/svg/*.png",
    exc: "!" + src + "/images/sprite/*" + " !" + src + "/images/dataURI/*",
  },
  sprite: {
    input: src + "/images/sprite/",
    output: dist + "/images/sprite/",
    css: src + "/sass/vendor/",
    html: src + "/html/guide/sprite.html",
  },
  html: {
    input: src + "/html/**/*.html",
    output: dist + "/",
    exc: "!./html/**/include/*.html, !./html/**/include/",
  },
  js: {
    input: src + "/js/",
    output: dist + "/js/",
  },
  pug: {
    input: src + "/pug/**/*.pug",
    output: dist + "/html/",
    exc: "!./html/pug/include/*.pug",
  },
};

//browser-sync
const browserSync = require("browser-sync");
function bs(done) {
  browserSync.init({
    server: { baseDir: dist },
    port: port,
    ui: { port: port + 1 },
    ghostMode: false,
    directory: true,
  });
  done();
}

// sass
const gulpsass = require("gulp-dart-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  postcss = require("gulp-postcss"),
  cssnano = require("cssnano"),
  autoprefixer = require("autoprefixer");
function sass() {
  var plugins = [autoprefixer(), cssnano()];
  return gulp
    .src(path.styles.inputFile)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpsass.sync().on("error", gulpsass.logError))
    .pipe(gulpsass({ errLogToConsole: true }).on("error", gulpsass.logError)) //nested compact expanded compressed
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(path.styles.output))
    .pipe(browserSync.stream({ match: "**/*.css" }));
  // .on('finish',browserSync.reload)
}

//html 브라우저 호환성 css 추가변경
function autopreFixer() {
  return gulp
    .src(path.scss.autoprefixer)
    .pipe(
      autoprefixer({
        cascade: true,
        remove: false,
      })
    )
    .on("finish", reload);
}

//이미지 압축
var imagemin = require("gulp-imagemin");
function imgMin() {
  return gulp
    .src([path.images.input + "*.*", path.images.exc])
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(path.images.output));
}

// html-include
const include = require("gulp-html-tag-include");
function includeHTML() {
  return gulp
    .src([path.html.input, "!" + path.html.input + "/**/include/*.html"])
    .pipe(include())
    .pipe(gulp.dest(path.html.output))
    .on("finish", browserSync.reload);
}

//PUG
var pug = require("gulp-pug");
function htmlPUG() {
  gulp
    .src(path.pug.input)
    .pipe(pug())
    .pipe(gulp.dest(path.pug.output))
    .on("finish", browserSync.reload);
}

//js minify
const minify = require("gulp-minify");
function min_js(done) {
  gulp
    .src([path.js.input])
    .pipe(
      minify({
        ext: {
          min: ".min.js",
        },
        ignoreFiles: [".min.js"],
      })
    )
    .pipe(gulp.dest(path.js.output))
    .pipe(browserSync.stream({ match: "**/*.js" }))
    .on("finish", browserSync.reload);
  done();
}

// js 이동
function jsCopy(done) {
  gulp
    .src(path.js.input + "**/*.js")
    .pipe(gulp.dest(path.js.output))
    .on("finish", browserSync.reload);
  done();
}

// img 이동 sprite폴더와 파일제외
function imgCopy(done) {
  gulp
    .src([path.images.input + "*.*", path.images.exc])
    .pipe(gulp.dest(path.images.output))
    .on("finish", browserSync.reload);
  done();
}

//clean-image
function imgClean() {
  return del([path.images.output]);
}

//clean-html
function htmlClean() {
  return del([path.html.output]);
}

//clean-html-include
function includeHtmlClean() {
  return del([path.html.output + "**/include"]);
}

//이미지 스프라이트 폴더설정
const spritesmith = require("gulp.spritesmith");
const getFolders = function (dir_path) {
  return fs.readdirSync(dir_path).filter(function (file) {
    return fs.statSync(paths.join(dir_path, file)).isDirectory();
  });
};
// 이미지 스프라이트
function spriteIcon(done) {
  //초기값 설정
  var imgName = "sprite.",
    cssName = "_sprite.",
    padding = 5,
    cssTemplate = "sprite.css.handlebars",
    layout = "left-right",
    folders = getFolders(path.sprite.input); //폴더별 스프라이트생성

  //폴더없이 메인루트일때
  var spriteData = gulp.src(path.sprite.input + "*.*").pipe(
    spritesmith({
      imgName: imgName + "png",
      cssName: cssName + "scss",
      padding: padding,
      cssTemplate: cssTemplate,
    })
  );
  spriteData.img.pipe(gulp.dest(path.sprite.output));
  spriteData.css.pipe(gulp.dest(path.sprite.css));

  //폴더별 스프라이트생성
  folders.forEach(function (folder) {
    spriteData = gulp.src(path.sprite.input + folder + "/*.png").pipe(
      spritesmith({
        imgName: imgName + folder + ".png",
        cssName: cssName + folder + ".scss",
        padding: padding,
        //algorithm: layout,
        cssTemplate: cssTemplate,
      })
    );
    spriteData.img.pipe(gulp.dest(path.sprite.output));
    spriteData.css.pipe(gulp.dest(path.sprite.css));
  });
  done();
}

//스프라이트 이미지 미리보기 가이드페이지 추가
function renderSprite(cb) {
  var directoryPath = paths.join(__dirname, path.sprite.input);
  var filePath = paths.join(__dirname, path.sprite.html);
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return console.log("폴더를 찾을수 없습니다. : " + err);
    }
    var images = "";
    for (let file of files) {
      let fileNameWithoutExtension = paths.basename(file, paths.extname(file));
      let filePath = "/images/sprite/" + file;
      //가이드 html 구조
      images += `<div class="spriteContainer__item"><figure class="spriteContainer__img"><img src="${filePath}" alt="${fileNameWithoutExtension}"><figcaption>${fileNameWithoutExtension}</figcaption></figure></div>\n`;
    }

    fs.readFile(filePath, function (err, data) {
      if (err) {
        return console.log(err);
      }
      var $ = cheerio.load(data);
      $("#spriteContainer").html(images);
      fs.writeFile(filePath, $.html(), function (err) {
        if (err) {
          return console.log(err);
        }
        cb();
      });
    });
  });
}

// data URI
const imageDataURI = require("gulp-image-data-uri");
const concat = require("gulp-concat");
function datauri(done) {
  gulp
    .src(path.images.input + "dataURI/*")
    .pipe(
      imageDataURI({
        template: {
          file: "./_datauri-tempate.handlebars",
        },
      })
    )
    .pipe(concat("_dataURI.scss"))
    .pipe(gulp.dest(path.styles.input + "vendor/"))
    .pipe(browserSync.stream({ match: "**!/!*.css" }));
  done();
}

function watchFile(done) {
  gulp.watch(path.styles.inputFile, sass);
  gulp.watch(path.js.input + "*.js", jsCopy);
  //gulp.watch(path.images.input+'*.*', imgCopy);
  //gulp.watch(path.images.input+'dataURI/*.*', datauri);
  gulp.watch(path.html.input, html);
  //gulp.watch(path.pug.input, htmlPUG);
  //gulp.watch(path.sprite.input+'**/*.{jpg,gif,png}',spriteIcon);
  done();
}

// 취합 다중 실행
const watch = gulp.parallel(watchFile, bs);
const imgUpdate = gulp.series(imgClean, imgCopy, spriteIcon, datauri);
const html = gulp.series(htmlClean, gulp.series(includeHTML, includeHtmlClean));
const build = gulp.series(imgUpdate, html, jsCopy, min_js, sass);

// tasks 선언
exports.default = watch;
exports.build = build;
exports.min_js = min_js;
exports.bs = bs;
exports.spriteIcon = spriteIcon;
exports.datauri = datauri;
exports.sass = sass;
exports.imageMin = imgMin;
exports.imgUpdate = imgUpdate;
exports.html = html;
exports.htmlPUG = htmlPUG;
exports.includeHTML = includeHTML;
exports.includeHtmlClean = includeHtmlClean;
exports.jsCopy = jsCopy;
exports.imgCopy = imgCopy;
exports.imgClean = imgClean;
exports.htmlClean = htmlClean;
exports.guideSprite = renderSprite;
