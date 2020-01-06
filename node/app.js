/** 写node原生不知不觉就能写乱, 代码略显丑陋. 希望老师能给出优化意见
 * ps: 有时遇到问题, 看文档不太明白, 网上资料又比较零散, 周围也没有能请教的人,
 *     这个时候, 老师会怎么办?
 */ 
const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require('qs')

const reqMap = [    // 请求匹配( 使用正则优化? )
    { match: "/utils", matchHandle: "utils", isReadFile: false },
    { match: ".js", matchHandle: "js", isReadFile: true },
    { match: ".jpg", matchHandle: "jpg", isReadFile: true },
    { match: ".ico", matchHandle: "ico", isReadFile: true },
    { match: "/", matchHandle: "page", isReadFile: true }
];

const getReqType = (req) => {   // 判断请求是否为读取文件
    let flag = false, matchHandle = "utils";
    for(let item of reqMap) {
        if(req.url.indexOf(item.match)>-1) {
            flag = item.isReadFile;
            matchHandle = item.matchHandle;
            break
        }
    }
    return { flag, matchHandle }
}


const getResourceParams = (req, matchHandle) => {    // 静态资源参数处理
    let url = req.url;
    const handler = {
        js: { ContentType: "text/javascript", fsUrl: "./static", charset: "utf8", readType: "file" },
        jpg: { ContentType: "image/jpeg", fsUrl: "./images", charset: "utf8", readType: "stream" },
        ico: { ContentType: "image/*", fsUrl: "./images", charset: "utf8", readType: "stream" },
        page: { ContentType: "text/html", fsUrl: "./static", charset: "utf8", readType: "file" },
    };
    let target = handler[matchHandle];
    let ContentType = target.ContentType;
    let readType = target.readType;
    let fsUrl = target.fsUrl + (url==="/"? "/index.html":url);
    let charset = target.charset;

    return { ContentType, fsUrl, charset, readType, matchHandle }
}

const handleReadFile = (response, resourceParams) => {
    let { ContentType, fsUrl, charset, readType, matchHandle } = resourceParams;
    const handler = {
        stream() {
            let stream = fs.createReadStream( fsUrl );
            let responseData = [];//存储文件流
            if (stream) {
                stream.on('data', function( chunk ) {
                    responseData.push( chunk );
                });
                stream.on('end', function() {
                    let finalData = Buffer.concat( responseData );
                    response.write( finalData );
                    response.end();
                });
            }
        },
        file() {
            fs.readFile(fsUrl, charset, (err, data) => {
                let res = data;
                if(!!err) {
                    let ContentType = "application/json";
                    res = "文件获取失败";
                    if(matchHandle==="page") {
                        ContentType = "text/html";
                        res = fs.readFileSync('./static/404.html');   // 404
                    }
                    response.setHeader("Content-Type", ContentType);
                }
                
                response.end(res);
            });
        },
    };
    // console.log(ContentType, fsUrl, charset);
    response.setHeader("Content-Type", ContentType);
    return handler[readType]()
}

// 请求服务
const app = http.createServer(function(request, response) {
    let { flag, matchHandle } = getReqType(request);
    // console.log(flag, matchHandle)
    if(flag) {  // 读取文件请求
        return handleReadFile(response, getResourceParams(request, matchHandle));
    }
    // ajax 请求
    let { query=null, pathname } = url.parse(request.url, true);
    let res = { // 返回json对象
        head: {
            status: 200,
            msg: "success"
        },
        ret_data: {}
    };
    // console.log(request.method, query);
    response.setHeader("Content-Type", "application/json");
    if(request.method==="GET") {
        res.ret_data = `你请求了${pathname}, 参数为 ${query.param}`;
        response.end(JSON.stringify(res));
    }else if(request.method==="POST") {
        let arr = [];
        request.on("data", (data) => {
            arr.push(data);
        })
        request.on("end", () => {
            // console.log("request.on('end') - arr ");
            // console.log(arr);
            // console.log(Buffer.concat(arr).toString());
            // console.log(qs.parse(Buffer.concat(arr).toString()));
            let body = qs.parse(Buffer.concat(arr).toString());
            res.ret_data = `你输入了${body.param}`;
            response.end(JSON.stringify(res));
        })
    }
});



app.listen(1080);
