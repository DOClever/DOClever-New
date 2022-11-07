import Koa = require('koa');
import path = require('path');
import body = require('koa-bodyparser');
import form=require("koa2-formidable")
import session = require('koa-session2');
import util=require("./util/util");
import fs=require("fs-extra")
var app = new Koa();
import yargs=require("yargs");
import staticServer=require("koa-static-server")
var argv=yargs.argv;
if(argv.webpack)
{
    var webpack = require('../node_modules/webpack'),
        webpackDevMiddleware = require('../node_modules/koa-webpack-dev-middleware'),
        webpackHotMiddleware = require('../node_modules/koa-webpack-hot-middleware'),
        webpackDevConfig = require('../Client/dev');
    var compiler = webpack(webpackDevConfig);
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true,
            chunks: false
        }
    }));
    app.use(webpackHotMiddleware(compiler));
}
(async function () {
    await util.init();
    var con=await import("./../config.json");
    var proxy=await import("./routes/proxy/proxy");
    var mock=await import("./routes/mock/mock");
    var root=await import("./routes/routes")
    app.keys=["doclever"]
    app.use(async (ctx,next)=>{
        let date=Date.now()
        await next()
        console.info(`${ctx.request.method} ${ctx.request.url} ${Date.now()-date}ms`)
    })
    app.use(async (ctx,next)=>{
        try {
            await next();
        }
        catch(err)
        {
            if(err instanceof Object && err.code)
            {
                util.err(ctx,err.code,err[ctx.cookies.get("language")?ctx.cookies.get("language"):"en"])
            }
            else if(err instanceof Object)
            {
                util.err(ctx,500,err.message)
            }
            else
            {
                util.err(ctx,500,err)
            }
        }
    })
    app.use(proxy.routes());
    app.use(proxy.allowedMethods());
    app.use(session({
        maxAge: 86400000,
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: false,
        key: 'DOClever'
    },app))
    app.use(form({
        uploadDir:path.join(con.filePath,"img"),
        keepExtensions:true
    }));
    app.use(body());
    app.use(mock.routes());
    app.use(mock.allowedMethods());
    app.use(root.routes());
    app.use(root.allowedMethods());
    app.use(staticServer({
        rootDir:fs.existsSync(path.join(__dirname,"../Client"))?path.join(__dirname,"../Client"):path.join(__dirname,"../../Client"),
        rootPath:"/html"
    }))
    app.use(staticServer({
        rootDir:fs.existsSync(path.join(__dirname,"../node_modules"))?path.join(__dirname,"../node_modules"):path.join(__dirname,"../../node_modules"),
        rootPath:"/node_modules"
    }))
    app.use(staticServer({
        rootDir:path.join(con.filePath,"img"),
        rootPath:"/img"
    }))
    app.use(staticServer({
        rootDir:path.join(__dirname,"resource"),
        rootPath:"/resource"
    }))
    app.use( function (ctx,next) {
        if((<any>ctx.request.req)._parsedUrl.pathname=="/")
        {
            ctx.response.redirect("/html/web/controller/login/login.html")
        }
    });

})();


export = app;
