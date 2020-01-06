module.exports = (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.body = JSON.stringify({
            "status": "服务器出错",
            "error": error.message
        })
    }
}