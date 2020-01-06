/** 第二天作业跟着老师的回放重新敲了一遍
 * ps: 
 * 1. 这个简单的error处理配合next处理让我学到了更好的方式( 之前写express的时候, 每次都要try-catch包一层, 感觉有点冗余 )
 * 
 * 2. 如果路由有很多, 那么按照现在思路app.js中不就需要引入很多router文件, router.use函数会多次重复写, 那么需要如何优化? 
 * ( 用数组循环的心事吗? 希望老师能讲一讲, 或者如何分层 )
 * 
 */
const Koa = require("koa");
const Router = require("koa-router");
const path = require("path");
const ejs = require("koa-ejs");
const static = require("koa-static");
const body = require("koa-bodyparser");

const config = require("./config");
const db = require("./libs/db");

const app = new Koa();
const router = new Router();

app.use(body());

ejs(app, {
    root: path.resolve(__dirname, "templete"),
    layout: false,
    viewExt: "ejs",
    cache: false,
    debug: false
});

app.context.config = config;
app.context.db = db;

router.use("/admin", require("./router/admin"));

app.use(static(path.resolve(__dirname, "./public")));
app.use(router.routes());

app.listen(1080, () => console.log("Server is running at http://localhost:1080"));