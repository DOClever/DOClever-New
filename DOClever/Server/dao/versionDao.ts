/**
 * Created by sunxin on 2017/6/26.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import group=require("../model/groupModel")
import interfaceModel=require("../model/interfaceModel")
import project=require("../model/projectModel")
import teamGroup=require("../model/teamGroupModel")
import version=require("../model/versionModel")
import groupVersion=require("../model/groupVersionModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import status=require("../model/statusModel")
import statusVersion=require("../model/statusVersionModel")
import testGroup=require("../model/testGroupModel")
import testModule=require("../model/testModuleModel")
import test=require("../model/testModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import poll=require("../model/pollModel")
import {api, user} from "../routes/generateParams";
import versionApi = require("../../Common/routes/version")
import {keys} from "../../Common/transform";
import {ctxFake, IVersionValidateUserRet} from "./types";
import {VersionModel} from "../model/types";
import {InstanceType} from "typegoose";
class VersionDao {
    async validateVersion (id:string,projectId:string,userId:string,referer:string){
        let ret=<IVersionValidateUserRet>{}
        if(id)
        {
            let obj=await version.findOne({
                _id:id
            });
            if(!obj)
            {
                throw e.versionNotFound;
            }
            ret.objVersion=obj;
        }
        let pro;
        if(projectId)
        {
            pro=projectId;
        }
        else if(ret.objVersion)
        {
            pro=ret.objVersion.project;
        }
        if(pro)
        {
            let obj=await project.findOne({
                _id:pro,
                $or:[
                    {
                        owner:userId
                    },
                    {
                        "users.user":userId
                    }
                ]
            });
            if(!obj)
            {
                obj=await project.findOne({
                    _id:pro
                });
                if(!obj)
                {
                    throw e.projectNotFound;
                }
                if(obj.team)
                {
                    let arrUser=await teamGroup.find({
                        team:obj.team,
                        users:{
                            $elemMatch:{
                                user:userId,
                                role:{
                                    $in:[0,2]
                                }
                            }
                        }
                    })
                    if(arrUser.length==0 && !obj.public && referer && !referer.endsWith("public/public.html"))
                    {
                        throw e.userForbidden;
                    }
                }
                else if(!obj.public && referer && !referer.endsWith("public/public.html"))
                {
                    throw e.userForbidden;
                }
            }
            ret.objProject=obj;
        }
        return ret;

    }

    async save (id:string,projectId:string,versionId:string,dis:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateVersion(id,projectId,userId,ctx.headers["referer"])
        let obj:InstanceType<VersionModel>;
        let update:any={
            project:projectId,
            version:versionId
        }
        if(dis)
        {
            update.dis=dis;
        }
        if(id)
        {
            obj=await version.findOneAndUpdate({
                _id:id
            },update,{
                new:true
            })
            obj=await version.populate(obj,{
                path:"creator",
                select:"name photo"
            });
        }
        else
        {
            let groupModel=group,interfaceCurModel=interfaceModel,statusModel=status;
            if(ctx.headers["docleverversion"])
            {
                groupModel=groupVersion;
                interfaceCurModel=interfaceVersion;
                statusModel=statusVersion;
            }
            if(objModel.objProject.source)
            {
                update.source=objModel.objProject.source
            }
            update.creator=userId;
            update.baseUrls=objModel.objProject.baseUrls;
            update.before=objModel.objProject.before;
            update.after=objModel.objProject.after;
            obj = await version.create(update);
            let query:any={
                project: projectId
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"];
            }
            let arr:any = await groupModel.find(query);
            for (let o of arr) {
                let id = o._id;
                delete o._doc._id;
                o._doc.version = obj._id
                let objGroup = await groupVersion.create(o._doc);
                let query:any={
                    group: id
                }
                if(ctx.headers["docleverversion"])
                {
                    query.version=ctx.headers["docleverversion"];
                }
                let arrInter = await interfaceCurModel.find(query);
                for (let o1 of arrInter) {
                    delete o1._doc._id;
                    o1._doc.version = obj._id;
                    o1._doc.group = objGroup._id;
                    await interfaceVersion.create(o1._doc);
                }
            }
            query={
                project: projectId
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"];
            }
            arr = await status.find(query);
            for (let o of arr) {
                delete o._doc._id;
                o._doc.version = obj._id
            }
            if(arr.length>0)
            {
                await statusVersion.insertMany(arr.map(function (obj) {
                    return obj._doc
                }));
            }
            obj=await version.populate(obj,{
                path:"creator",
                select:"name photo"
            });
        }
        return obj

    }

    async list (projectId:string,page:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateVersion(null,projectId,userId,ctx.headers["referer"])
        let arr=await version.find({
            project:objModel.objProject._id
        },null,{
            populate:{
                path:"creator",
                select:"name photo"
            },
            sort:"-createdAt",
            skip:page*10,
            limit:10
        });
        return arr

    }

    async remove (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateVersion(id,null,userId,ctx.headers["referer"])
        await groupVersion.remove({
            version:objModel.objVersion._id
        })
        await interfaceVersion.remove({
            version:objModel.objVersion._id
        })
        await statusVersion.remove({
            version:objModel.objVersion._id
        })
        await interfaceSnapshot.remove({
            version:objModel.objVersion._id
        })
        await poll.remove({
            version:objModel.objVersion._id
        })
        await objModel.objVersion.remove()

    }

    async roll (id:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateVersion(id,null,userId,ctx.headers["referer"])
        await group.remove({
            project:objModel.objProject._id
        })
        await interfaceModel.remove({
            project:objModel.objProject._id
        })
        await status.remove({
            project:objModel.objProject._id
        })
        await test.remove({
            project:objModel.objProject._id
        })
        let arr:any=await testModule.find({
            project:objModel.objProject._id
        })
        await testGroup.remove({
            project:{
                $in:arr.map(function (obj) {
                    return obj._id.toString()
                })
            }
        })
        await testModule.remove({
            project:objModel.objProject._id
        })
        await poll.remove({
            project:objModel.objProject._id,
            version:{
                $exists:false
            }
        })
        arr = await groupVersion.find({
            project: objModel.objProject._id,
            version:objModel.objVersion._id
        });
        for (let o of arr) {
            let id = o._id;
            delete o._doc._id;
            delete o._doc.version;
            let objGroup = await group.create(o._doc);
            let arrInter = await interfaceVersion.find({
                group: id
            });
            for (let o1 of arrInter) {
                delete o1._doc._id;
                delete o1._doc.version;
                o1._doc.group = objGroup._id;
                await interfaceModel.create(o1._doc);
            }
        }
        arr = await statusVersion.find({
            project: objModel.objProject._id,
            version:objModel.objVersion._id
        });
        for (let o of arr) {
            delete o._doc._id;
            delete o._doc.version
        }
        if(arr.length>0)
        {
            await status.insertMany(arr.map(function (obj) {
                return obj._doc
            }));
        }
        let obj= await poll.findOne({
            project: objModel.objProject._id,
            version:objModel.objVersion._id
        },null,{
            populate:{
                path:"test"
            }
        });
        if(obj)
        {
            delete obj._doc._id;
            delete obj._doc.version;
            obj._doc.testType="Test";
            await poll.create(obj._doc);
        }
        objModel.objProject.baseUrls=objModel.objVersion.baseUrls;
        objModel.objProject.before=objModel.objVersion.before;
        objModel.objProject.after=objModel.objVersion.after;
        await objModel.objProject.save();

    }

}

export=new VersionDao;












