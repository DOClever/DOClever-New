
import admin=require("../model/adminModel");
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
        if(ctx.session.admin)
        {
            userId=ctx.session.admin;
        }
        else
        {
            throw e.userNotLogin;
        }
        let obj=await admin.findOne({
            _id:userId
        });
        if(!obj)
        {
            throw e.userNotFound;
        }
        ctx.state.admin=obj;
        let ret=await req.handle(ctx);
        util.ok(ctx,ret)
    }
    catch (err)
    {
        if(bUp)
        {
            ctx.state.f.forEach(function (obj) {
                util.delImg(obj.dbPath);
            })
        }
        throw err
    }
};
