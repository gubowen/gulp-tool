"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");


const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

const babel = require("gulp-babel");
const rename = require("gulp-rename");

const clean  = require("gulp-clean");

const uglifyjs = require("uglify-js");
const composer = require("gulp-uglify/composer");

const  minify = composer(uglifyjs,console);


const gutils = require("gulp-util");


const uglifycss = require("gulp-uglifycss");

const minimize = require("gulp-minimize");

const  imagemin = require("gulp-imagemin");


//Sass编译
gulp.task("sass", cb => {
    return gulp.src("src/**/*.scss")
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest("./src"))
        .pipe(reload({stream: true}));
});


//es6 -> es5
gulp.task("es2015", cb => {
    return gulp.src("src/**/*.es6.js")
        .pipe(babel({
            presets: [
                ["@babel/preset-env", {
                    "targets": {
                        "chrome": "45",
                        "ie": "10"
                    }
                }]
            ],
            plugins: [
                    ["@babel/plugin-proposal-class-properties",{"loose":true}],
                ["@babel/plugin-transform-runtime",{
                "regenerator":true
                }]
            ]
        }))
        .pipe(rename(path=>{
            path.basename = path.basename.split(".es6")[0];
        }))
        .pipe(gulp.dest("./src"))
});


// 开发环境  启动 服务

gulp.task("serve", cb => {
    browserSync.init({
        server: "./",
        host: "local.test.com",
        port: "9999"
    });
    gulp.watch("src/**/*.es6.js").on("change",gulp.series("es2015", cb => {
            reload();
    }));
    gulp.watch("src/**/*.scss").on("change", gulp.series("sass", cb => {
        reload();
    }));
    gulp.watch("src/**/*.tpl").on("change",cb => {
        reload();
    });
})

//目标目录清理
gulp.task("clean",async  cb=>{
    await  gulp.src("dist/",{read:false})
        .pipe(clean());
})

//JS 部分压缩
gulp.task("uglifyJS", async cb =>{


    await gulp.src(["src/**/*.js","!src/**/*.es6.js"])
        .pipe(minify({
            mangle:{
                reserved:["require"]
            },
            compress:{
                drop_console:false
            }
        }))
        .on('error',err=>{
            gutils.log(gutils.colors.red('[Error]'),err.toString());
        })
        .pipe(rename(path =>{
            path.basename = path.basename.split(".")[0];
        }))
        .pipe(gulp.dest("./dist/"))
});


//css压缩
gulp.task("uglifyCss", async cb =>{
    await gulp.src("src/**/*.css")
        .pipe(uglifycss({
              "maxLineLen" : 80 ,
               "ugluComments" : true
    }))
        .pipe(gulp.dest("./dist/"))
});


//图片压缩
gulp.task("uglifyImage",async cb=>{
    await  gulp.src("src/**/*.{jpg,jpeg,png,gif,svg}")
        .pipe(imagemin([
            imagemin.gifsicle({interlaced:true}),
            imagemin.jpegt5ran({progressive:5}),
            imagemin.svgo({
                plugins:[
                    {removeViewBox:true},
                    {cleanupIDs:false}
                ]
            })
        ]))
        .pipe(gulp.dest("./dist/"))
});


//静态资源拷贝
gulp.task("copyStatic",async cb =>{
       await gulp.src("src/**/*.{eot,ttf,wpff,webp,ico,mp3,mp4}")
           .pipe(gulp.dest("./dist/"))
});

//tpl 压缩复制
gulp.task("uglifyTpl",async cb =>{
    await gulp.src("src/**/*.{tpl,html}")
        .pipe(minimize())
        .pipe(gulp.dest("./dist/"))
});


//串行 压缩流

gulp.task("compress",gulp.series("es2015","sass","uglifyCss","uglifyTpl","copyStatic",async cb=>{
    await  cb();
}));


//build

gulp.task("build",gulp.series("compress",async cb=>{
    await cb();
}));




















