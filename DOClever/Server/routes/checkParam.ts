/**
 * Created by sunxin on 16/3/30.
 */
import e=require("../util/error.json");
import util=require("../util/util");
import checkUser=require("./checkUser");
import checkAdmin=require("./checkAdmin");
import {getRouteApi} from "./generateParams"
import path=require("path")
async function route(category) {
    var router = util.router(category);
    if(router instanceof Array)
    {
        return router[0];
    }
    var instance=await import("./"+category+"/"+category);
    router.all("*",async function(ctx:any,next:any)
    {
        const inter=getRouteApi(category);
        let req=ctx.request;
        let res=ctx.response;
        var bFind=false;
        var index;
        for(var key in inter)
        {
            if(inter[key].method==ctx.req.method && inter[key].path===(<any>ctx.req)._parsedUrl.pathname)
            {
                bFind=true;
                index=key;
                break;
            }
        }
        if(!bFind)
        {
            await next();
            return;
        }
        var p;
        var id;
        if(ctx.req.method=="POST" || ctx.req.method=="PUT" || ctx.req.method=="PATCH")
        {
            if(!ctx.state.p)
            {
                ctx.state.p=req.body;
            }
            if(!ctx.state.f && (<any>req).files)
            {
                let obj={},objP={}
                for(let key in (<any>req).files)
                {
                    obj[key]=(<any>req).files[key].path
                    let filePath=obj[key]
                    let i=filePath.lastIndexOf(path.sep);
                    i=filePath.lastIndexOf(path.sep,i-1);
                    filePath=filePath.substring(i).replace(/\\/g,"/");
                    objP[key]=filePath
                }
                ctx.state.f=obj

                ctx.state.p=Object.assign({},ctx.state.p,objP)
            }
        }
        else
        {
            ctx.state.p=req.query;
        }
        var param=inter[index].param;
        let temp={};
        for(var key in param) {
            if ((ctx.state.p[key] === undefined || ctx.state.p[key].length==0) && !param[key].optional) {
                ctx.body={
                    code: e.missParam,
                    msg: "miss " + key
                };
                return;
            }
            else if (ctx.state.p[key] && (param[key].type == Number || param[key]==Number)) {
                if(isNaN(ctx.state.p[key]))
                {
                    ctx.body={
                        code: e.paramTypeWrong,
                        msg: "param " + key + " must be number"
                    };
                    return;
                }
                else
                {
                    temp[key]=parseFloat(ctx.state.p[key]);
                }
            }
            else if(ctx.state.p[key] && param[key].type == String && (param[key].uppercase || param[key].lowercase))
            {
                if(param[key].uppercase)
                {
                    temp[key]=ctx.state.p[key].toUpperCase();
                }
                else
                {
                    temp[key]=ctx.state.p[key].toLowerCase();
                }
            }
            else if(ctx.state.p[key]!=undefined)
            {
                temp[key]=ctx.state.p[key];
            }
            if(temp[key] && param[key].validate)
            {
                let bSuccess=util.validateParam(temp[key],param[key].validate);
                if(!bSuccess)
                {
                    ctx.body={
                        code: e.validateParamFail,
                        msg: "param " + key + " validate failed"
                    };
                    return;
                }
            }
            if(temp[key] && param[key].rename)
            {
                temp[param[key].rename]=temp[key];
                delete temp[key];
            }
        }
        ctx.state.p=temp;
        ctx.req.cookies=ctx.request.cookies=ctx.cookies
        let handle=inter[index].handle
        handle=handle.bind(instance)
        if(inter[index].user)
        {
            (<any>req).handle=handle
            await checkUser(<unknown>ctx);
        }
        else if(inter[index].admin)
        {
            (<any>req).handle=handle
            await checkAdmin(<unknown>ctx);
        }
        else
        {
            let obj=await handle(ctx);
            util.ok(ctx,obj)
        }
    });
    return router;
}

export=route;
