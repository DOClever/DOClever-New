/**
 * Created by sunxin on 16/3/29.
 */
import user=require("../model/userModel");
import util=require("../util/util");
import e=require("../util/error.json");



export=async function (ctx) {
    let req:any=ctx.request
    let res=ctx.response
    let bUp=false;
    if(/^multipart\/form-data/i.test(ctx.req.headers["content-type"]))
    {
        bUp=true;
    }
    try {
        let userId;
        if(ctx.session.userid)
        {
            userId=ctx.session.userid;
        }
        else
        {
            if(ctx.cookies.get("id") || ctx.cookies.get("docleveruserid"))
            {
                userId=ctx.cookies.get("id")?ctx.cookies.get("id"):ctx.cookies.get("docleveruserid");
                ctx.session.userid=userId;
            }
            else
            {
                if(ctx.req.headers["referer"].endsWith("public/public.html"))
                {
                    userId=0;
                }
                else
                {
                    throw e.userNotLogin;
                }
            }
        }
        let obj;
        if(userId==0)
        {
            obj={
                _id:"000000000000000000000000",
                name:"temp"
            }
        }
        else
        {
            obj=await user.findOne({
                _id:userId
            });
            if(!obj)
            {
                throw e.userNotFound;
            }
            else if(obj.state==0)
            {
                throw e.userForbidden;
            }
        }
        ctx.state.user=obj;
        let ret=await req.handle(ctx);
        util.ok(ctx,ret)
    }
    catch (err)
    {
        if(bUp)
        {
            ctx.strate.f.forEach(function (obj) {
                util.delImg(obj.dbPath);
            })
        }
        throw err
    }
};
