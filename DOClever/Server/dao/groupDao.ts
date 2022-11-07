
import e=require("../util/error.json");
import util=require("../util/util");
import project=require("../model/projectModel")
import group=require("../model/groupModel")
import interfaceModel=require("../model/interfaceModel")
import interfaceVersion=require("../model/interfaceVersionModel")
import interfaceSnapshot=require("../model/interfaceSnapshotModel")
import groupVersion=require("../model/groupVersionModel")
import version=require("../model/versionModel")
import teamGroup=require("../model/teamGroupModel")
import uuid=require("uuid");
import groupApi = require("../../Common/routes/group")
import {GroupModel, GroupVersionModel, InterfaceModel, InterfaceVersionModel} from "../model/types";
import {InstanceType} from "typegoose";
import {ctxFake, IGroupValidateUserRet} from "./types";
import {IKoa_ctx} from "../types/global";
class Group {
    async sort (id:string,docleverVersion:string,interfaceCurModel:typeof interfaceModel | typeof interfaceVersion,groupModel:typeof group|typeof groupVersion,objGroup:GroupModel|GroupVersionModel,objMove:GroupModel,index:number,bGroup:boolean){
        let arr;
        if(bGroup)
        {
            let query:any={
                project:id
            };
            if(objGroup)
            {
                query.parent=objGroup.id;
            }
            else
            {
                query.parent={
                    $exists:false
                }
            }
            if(docleverVersion)
            {
                query.version=docleverVersion
            }
            arr=await groupModel.find(query,null,{
                sort:"sort"
            })
        }
        else
        {
            let query:any={
                project:id,
                group:objGroup._id
            };
            if(docleverVersion)
            {
                query.version=docleverVersion
            }
            arr=await (<any>interfaceCurModel).find(query,null,{
                sort:"sort"
            })

        }
        for(let i=0;i<arr.length;i++)
        {
            let obj=arr[i];
            if(obj._id.toString()==objMove._id.toString())
            {
                arr.splice(i,1);
                break;
            }
        }
        arr.splice(index,0,objMove);
        for(let i=0;i<arr.length;i++)
        {
            let obj=arr[i];
            obj.sort=i;
            await obj.save();
        }
    }
    async getChild(docleverVersion:string,cookieSort:number,interfaceCurModel:typeof interfaceModel | typeof interfaceVersion,groupModel:typeof group|typeof groupVersion,id:string,obj:GroupModel|GroupVersionModel,bInter:boolean){
        let query:any={
            project:id,
            parent:obj?obj.id:{
                $exists:false
            }
        }
        if(docleverVersion)
        {
            query.version=docleverVersion
        }
        let sort="name";
        if(cookieSort==1)
        {
            sort="-updatedAt";
        }
        else if(cookieSort==2)
        {
            sort="sort";
        }
        let arr:(InstanceType<GroupModel>|InstanceType<GroupVersionModel>|InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>)[]=await groupModel.find(query,null,{
            sort:sort
        })
        for(let obj of arr)
        {
            obj._doc.data=await this.getChild(docleverVersion,cookieSort,interfaceCurModel,groupModel,id,obj as GroupModel|GroupVersionModel,bInter);
        }
        if(bInter && obj)
        {
            let arrInterface=await (<any>interfaceCurModel).find({
                group:obj._id
            },"_id name method finish url delete",{
                sort:sort
            });
            arr=arr.concat(arrInterface);
        }
        return arr;
    }

    async validateUser (docleverVersion:string,referer:string,groupId:string,id:string,userId:string){
        let ret=<IGroupValidateUserRet>{};
        ret.interfaceModel=interfaceModel;
        ret.groupModel=group;
        if(docleverVersion)
        {
            let versionModel=await version.findOne({
                _id:docleverVersion
            })
            if(!versionModel)
            {
                throw e.versionInvalidate;
            }
            ret.interfaceModel=interfaceVersion;
            ret.groupModel=groupVersion;
        }
        let grp;
        if(groupId)
        {
            grp=await ret.groupModel.findOne({
                _id:groupId
            });
            if(!grp)
            {
                throw e.groupNotFound;
            }
        }
        let obj=await project.findOne({
            _id:id?id:grp.project,
            $or:[
                {
                    owner:userId
                },
                {
                    users:{
                        $elemMatch:{
                            user:userId,
                        }
                    }
                }
            ]
        })
        if(!obj)
        {
            obj=await project.findOne({
                _id:id?id:grp.project,
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
            ret.objProject=obj;
            ret.objGroup=grp;
            return ret
        }
        else
        {
            ret.objProject=obj;
            ret.objGroup=grp;
            return ret
        }

    }



    async create (name:string,id:string,groupId:string,parent:string,userId:string,importType:number,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],groupId,id,userId)
        let query:any={
            name:name,
            project:id
        }
        if(ctx.headers["docleverversion"])
        {
            query.version=ctx.headers["docleverversion"]
        }
        let objParent;
        if(parent)
        {
            objParent=await objModel.groupModel.findOne({
                _id:parent
            });
            if(!objParent)
            {
                throw e.groupNotFound;
            }
            else
            {
                query.parent=objParent.id;
            }
        }
        let obj=await objModel.groupModel.findOne(query);
        if(obj)
        {
            throw e.duplicateName;
        }
        if(groupId)
        {
            if(name)
            {
                objModel.objGroup.name=name;
            }
            if(parent)
            {
                objModel.objGroup.parent=parent;
            }
            await objModel.objGroup.save();
        }
        else
        {
            let query:any={
                name:name,
                project:id,
                id:uuid()
            }
            if(parent)
            {
                query.parent=objParent.id;
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"]
            }
            let result=await objModel.groupModel.create(query);
            if(importType==1)
            {
                return result
            }
        }
        let arr=await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,id,null,true);
        return arr;
    }



    async remove (userId,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],null,null,userId)
        if(objModel.objGroup.type==0)
        {
            let query:any={
                type:1,
                project:objModel.objGroup.project
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"]
            }
            let objTrash=await objModel.groupModel.findOne(query);
            let removeChild=async function (objGroup) {
                let arrGroup=await objModel.groupModel.find({
                    project:objModel.groupModel.project,
                    parent:objGroup.id
                });
                for(let obj of arrGroup)
                {
                    await removeChild(obj);
                }
                await objModel.interfaceModel.update({
                    group:objGroup._id
                },{
                    group:objTrash._id
                },{
                    multi:true
                })
                await interfaceSnapshot.update({
                    group:objGroup._id
                },{
                    group:objTrash._id
                },{
                    multi:true
                });
                await objGroup.remove();
            }
            await removeChild(objModel.objGroup);
            let arr=await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,objModel.objGroup.project.toString(),null,true);
            return arr
        }
        else
        {
            throw e.userForbidden;
        }

    }


    async exportJSON (groupId:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],groupId,null,userId)
        let obj={
            name:objModel.objGroup.name,
            flag:"SBDoc",
            data:[]
        };
        let _map=async function(id,obj) {
            let query:any={
                project:id,
                parent:obj?obj.id:{
                    $exists:false
                }
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"]
            }
            let arr:(InstanceType<GroupModel>|InstanceType<GroupVersionModel>|InstanceType<InterfaceModel>|InstanceType<InterfaceVersionModel>)[]=await objModel.groupModel.find(query,"-parent -version -project",{
                sort:"name"
            })
            for(let obj of arr)
            {
                obj._doc.data=await _map(id,obj);
                delete obj._doc._id;
            }
            let arrInterface=await (<any>objModel.interfaceModel).find({
                group:obj._id
            },"-_id -id -project -group -owner -editor -version",{
                sort:"name"
            });
            arr=arr.concat(arrInterface);
            return arr;
        }
        obj.data=await _map(objModel.objGroup.project,objModel.objGroup);
        let content=JSON.stringify(obj);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(objModel.objGroup.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        };
        return {headers,content}
    }



    async importJSON (id:string,groupId:string,json:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],groupId,id,userId)
        let obj;
        try{
            obj=JSON.parse(json);
        }
        catch (err)
        {
            throw e.systemReason;
            return;
        }
        if(obj.flag!="SBDoc")
        {
            throw e.systemReason;
            return;
        }
        let objProject=await project.findOne({
            _id:id
        })
        if(!objProject)
        {
            throw e.projectNotFound;
            return;
        }
        if(groupId)
        {
            let group=await objModel.groupModel.findOne({
                _id:groupId
            })
            if(!group)
            {
                throw e.groupNotFound;
                return;
            }
        }
        let importChild=async function (data,objParent) {
            for(let item of data)
            {
                if(item.data)
                {
                    let query:any={
                        name:item.name,
                        project:objProject._id,
                        id:uuid(),
                        type:0
                    };
                    if(objParent)
                    {
                        query.parent=objParent.id;
                    }
                    if(ctx.headers["docleverversion"])
                    {
                        query.version=ctx.headers["docleverversion"]
                    }
                    let objGroup=await objModel.groupModel.create(query);
                    await importChild(item.data,objGroup);
                }
                else
                {
                    item.project=objProject._id;
                    item.group=objParent._id;
                    item.owner=userId;
                    item.editor=userId;
                    item.id=uuid();
                    if(ctx.headers["docleverversion"])
                    {
                        item.version=ctx.headers["docleverversion"]
                    }
                    if(!item.param)
                    {
                        item.param=[];
                        let o:any={
                            name:"未命名",
                            remark:"",
                            id:uuid(),
                            header:item.header,
                            queryParam:item.queryParam,
                            restParam:item.restParam,
                            outParam:item.outParam,
                            outInfo:item.outInfo,
                            before:item.before,
                            after:item.after
                        }
                        if(item.bodyParam)
                        {
                            o.bodyParam=item.bodyParam;
                            o.bodyInfo=item.bodyInfo;
                        }
                        delete item.header;
                        delete item.queryParam;
                        delete item.restParam;
                        delete item.outParam;
                        delete item.outInfo;
                        delete item.before;
                        delete item.after;
                        delete item.bodyParam;
                        delete item.bodyInfo;
                        item.param.push(o);
                    }
                    await objModel.interfaceModel.create(item);
                }
            }
        }
        await importChild([obj],objModel.objGroup?objModel.objGroup:null)
        let arr=await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,objProject._id,null,true);
        return arr

    }


    async move (groupId:string,to:string,index:number,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],groupId,null,userId)
        let toGroup;
        if(to)
        {
            toGroup=await objModel.groupModel.findOne({
                _id:to
            });
            if(!toGroup)
            {
                throw e.groupNotFound;
            }
        }
        let obj=await objModel.groupModel.findOneAndUpdate({
            _id:groupId
        },to?{
            parent:toGroup.id
        }:{
            $unset:{
                parent:1
            }
        },{
            new:true
        });
        await this.sort(groupId,ctx.headers["docleverversion"],objModel.interfaceModel,objModel.groupModel,toGroup,obj,index?index:0,true)
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,obj.project.toString(), null,true)
        return arr

    }


    async merge (groupId:string,userId:string,ctx=ctxFake){
        let objModel=await this.validateUser(ctx.headers["docleverversion"],ctx.headers["referer"],groupId,null,userId)
        await objModel.groupModel.update({
            _id:groupId
        },{
            $unset:{
                delete:1
            }
        })
        let mergeChild=async function(obj) {
            let query:any={
                project:objModel.objProject._id,
                parent:obj.id
            }
            if(ctx.headers["docleverversion"])
            {
                query.version=ctx.headers["docleverversion"]
            }
            let arr=await objModel.groupModel.find(query)
            for(let obj of arr)
            {
                await objModel.groupModel.findOneAndUpdate({
                    _id:obj._id
                },{
                    $unset:{
                        delete:1
                    }
                })
                await mergeChild(obj);
            }
            await objModel.interfaceModel.update({
                group:obj._id
            },{
                $unset:{
                    delete:1
                }
            },{
                multi:true
            });
        }
        await mergeChild(objModel.objGroup);
        let arr = await this.getChild(ctx.headers["docleverversion"],Number(ctx.cookies.get("sort")),objModel.interfaceModel,objModel.groupModel,objModel.objGroup.project.toString(),null,true);
        return arr

    }
}


export=new Group;









