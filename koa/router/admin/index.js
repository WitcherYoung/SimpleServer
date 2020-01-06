const Router = require("koa-router");
const router = new Router();
const md5 = require("md5-node");

router.get('/login', async (ctx, next) => {
    // ctx.body = "login";
    await ctx.render("admin/login", {
        URL_PATH: ctx.config.URL_PATH,
    })
});

router.post("/login", async (ctx, next) => {
    let { username, password } = ctx.request.body;
    
    password = md5(password.trim());
    let res = await ctx.db.query(`SELECT user FROM admin WHERE user = '${username.trim()}' and password = '${password}'`)

    console.log("result of ctx.body.query: ", res)

    ctx.response.type = "json";
    ctx.response.body = JSON.stringify({
        head: {
            code: 1,
            msg: !res.length? "登录失败":"登录成功"
        }
    })
})

module.exports = router.routes();