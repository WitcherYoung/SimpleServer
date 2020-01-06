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

// router.use("/", require("./router/index"));
router.use("/admin", require("./router/admin"));

// router.get("/", async (ctx, next) => {
//     console.log(123);
//     ctx.body = "123";
// })
app.use(static(path.resolve(__dirname, "./public")));
app.use(router.routes());

app.listen(1080, () => console.log("Server is running at http://localhost:1080"));