/** 之前写过 express, 对koa有一些了解
 * node 的一些API还是很陌生, 主要还是工作时以前端为主, 期待老师的第二次课堂
 */
const Koa = require("koa");
const KoaRouter = require("koa-router");
const fs = require("fs");
const URL = require("url");
const qs = require("qs")

const app = new Koa();

const STATICMATCH = [   // 静态资源匹配
    { match: "js", path: "./static", matchType: "js", ContentType: "javascript", },
    { match: ".jpg", path: "./images", matchType: "jpg", ContentType: "jpeg", },
    { match: ".ico", path: "./images", matchType: "ico", ContentType: "*", },
    { match: "/", path: "./static", matchType: "html", ContentType: "html", },
]

const handleRouter = (route) => {
    if(route.indexOf("/get")>-1||route.indexOf("/post")>-1) { // get||post请求
        return {
            url: route,
            matchType: "interface", 
        } 
    }    
    // 静态资源
    let url = "", matchType = "", ContentType = "";
    for(let item of STATICMATCH) {
        if(route.indexOf(item.match)>-1) {
            url = item.path + (route==="/"? "/index": route);
            matchType = item.matchType;
            ContentType = item.ContentType;
            break;
        }
    }
    return { url, matchType, ContentType }
}

const handleStaticResouce = (url, matchType, ContentType, ctx, next) => {
    let fileType = "other";
    if(matchType==="html"||matchType==="js") {
        fileType = "file";
        (matchType==="html")&&(url += "." + matchType);
    }
    const handleNotFound = {
        file() { ctx.body = 404; },
        other() {
            ctx.body = 404;
        }
    };
    console.log(url);
    if(!fs.existsSync(url)) {  // 文件不存在
        return handleNotFound[fileType]();
    }
    ctx.response.type = ContentType;
    return ctx.response.body = fs.createReadStream(url);
}

const postParam = (ctx) => {
    return new Promise((resolve, reject) => {
        try {
          let postdata = "";
          ctx.req.addListener('data', (data) => {
            postdata += data
          })
          ctx.req.addListener("end",() => {
            resolve( qs.parse( postdata ) )
          })
        } catch ( err ) {
          reject(err)
        }
      })
}

app.use(async (ctx, next) => {
    let { url, matchType, ContentType } = handleRouter(ctx.url);
    if (matchType!=="interface") { // 访问静态资源
        return handleStaticResouce(url, matchType, ContentType , ctx, next)
    }

    let query = URL.parse(ctx.url, true);
    let res = { // 返回json对象
        head: {
            status: 200,
            msg: "success"
        },
        ret_data: {}
    };
    console.log(query)
    ctx.response.type = "json";
    if(ctx.method==="GET") {
        res.ret_data = `你请求了 ${query.pathname}, 参数为 ${query.query.param}`;
    }else if(ctx.method==="POST") {
        let body = await postParam(ctx);
        res.ret_data = `你输入了 ${body.param}`;
    }
    ctx.response.body = res;
})
    

app.listen(1081);