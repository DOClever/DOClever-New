/**
 * Created by sunxin on 2017/2/5.
 */
import Router=require("koa-router");
import e=require("../../util/error.json");
import util=require("../../util/util");
import project=require("../../model/projectModel")
import interfaceModel=require("../../model/interfaceModel")
import interfaceVersion=require("../../model/interfaceVersionModel")
var router=new Router();
router.use("/:id",async function(ctx,next) {
    let req:any=ctx.request;
    let res=ctx.response

        ctx.state.f.forEach(function (obj) {
            util.delImg(obj.dbPath);
        })
        if(req.params.id.length!=24 && req.params.id.length!=48)
        {
            throw e.projectNotFound;
        }
        let projectId=req.params.id.substr(0,24);
        let versionId=req.params.id.substr(24,24);
        req.interfaceModel=interfaceModel;
        if(versionId)
        {
            req.interfaceModel=interfaceVersion;
            req.version=versionId;
        }
        let obj=await project.findOne({
            _id:projectId
        })
        if(!obj)
        {
            throw e.projectNotFound;
        }
        let mockUrl=req.originalUrl.substr(req.params.id.length+6);
        let index=mockUrl.indexOf("?");
        if(index>-1)
        {
            mockUrl=mockUrl.substring(0,index);
        }
        if(mockUrl.length==0)
        {
            throw e.systemReason;
        }
        let query:any={
            url:{
                $in:[mockUrl,mockUrl.substr(1)]
            },
            project:obj._id,
            method:req.method,
        };
        if(versionId)
        {
            query.version=versionId;
        }
        let objInter=await req.interfaceModel.findOne(query)
        if(!objInter)
        {
            let mockArr=mockUrl.split("/");
            let query:any={
                method:req.method,
                project:obj._id
            }
            if(versionId)
            {
                query.version=versionId;
            }
            let arr=await req.interfaceModel.find(query);
            for(let o of arr)
            {
                let arrUrl=o.url.split("/");
                if(arrUrl.length==mockArr.length)
                {
                    let bMatch=true,param={};
                    for(let i=0;i<arrUrl.length;i++)
                    {
                        let start=arrUrl[i].indexOf("{");
                        let end=arrUrl[i].indexOf("}");
                        if(!(start>-1 && end>-1 && arrUrl[i].length>2))
                        {
                            if(arrUrl[i]!=mockArr[i])
                            {
                                bMatch=false;
                                break;
                            }
                        }
                        else if(start>-1 && end>-1 && arrUrl[i].length>2)
                        {
                            let str=arrUrl[i].substring(start+1,end);
                            let len=arrUrl[i].substr(end+1).length;
                            param[str]=mockArr[i].substr(start,mockArr[i].length-(start+len));
                        }
                    }
                    if(bMatch)
                    {
                        req.obj=o;
                        req.param=param;
                        next();
                        return;
                    }
                }
            }
            throw e.interfaceNotFound;
        }
        else
        {
            req.obj=objInter;
            next();
        }

})

router.use(async function(ctx,next) {
    let req:any=ctx.request;
    let res=ctx.response

        let param,clientParam,type;
        if(req.obj.method=="GET" || req.obj.method=="DELETE")
        {
            type="query";
            clientParam=req.query;
        }
        else
        {
            if(ctx.req.headers["content-type"]=="application/json")
            {
                type="json";
            }
            else
            {
                type="body";
            }
            clientParam=ctx.state.p || req.body;
        }
        param=await util.getMockParam(clientParam,req.obj,type,req.version);
        ctx.set("finish-doclever",req.obj.finish);
        let info=util.handleMockInfo(req.param,req.query,req.body,ctx.req.headers,req.obj,req.protocol+"://"+ctx.req.headers.host+req.originalUrl);
        if(!param.outInfo || param.outInfo.type==0)
        {
            let result=param.outInfo.jsonType==1?[]:{};
            util.convertToJSON(param.outParam,result,info);
            ctx.body=result;
        }
        else
        {
            ctx.body=util.mock(param.outInfo.rawMock,info);
        }

})



export=router;
