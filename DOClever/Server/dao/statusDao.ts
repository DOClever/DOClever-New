/**
 * Created by sunxin on 2017/4/13.
 */


import e=require("../util/error.json");
import util=require("../util/util");
import project=require("../model/projectModel")
import status=require("../model/statusModel")
import statusVersion=require("../model/statusVersionModel")
import version=require("../model/versionModel")
import uuid=require("uuid");
import {api, user} from "../routes/generateParams";
import statusApi = require("../../Common/routes/status")
import {keys} from "../../Common/transform";
import {ctxFake} from "./types";
import {StatusModel, StatusVersionModel} from "../model/types";
import {InstanceType} from "typegoose";
class StatusDao {
    async validate (docleverVersion:string){

        let statusModel:typeof status|typeof statusVersion=status;
        if(docleverVersion)
        {
            let objVersion=await version.findOne({
                _id:docleverVersion
            })
            if(!objVersion)
            {
                throw e.versionInvalidate;
            }
            statusModel=statusVersion;
        }
        return statusModel;
    }


    async save (id:string,name:string,project:string,data:string,ctx=ctxFake){
        let statusModel=await this.validate(ctx.headers["docleverversion"])
        var obj:any={};
        if(name)
        {
            obj.name=name;
        }
        if(project)
        {
            obj.project=project;
        }
        if(data)
        {
            obj.data=JSON.parse(data)
        }
        let ret:InstanceType<StatusModel>|InstanceType<StatusVersionModel>;
        if(id)
        {
            ret=await statusModel.findOneAndUpdate({
                _id:id
            },obj,{
                new:true
            });
        }
        else
        {
            obj.id=uuid();
            if(ctx.headers["docleverversion"])
            {
                obj.version=ctx.headers["docleverversion"]
            }
            ret=await statusModel.create(obj);
        }
        return ret

    }


    async remove (id:string,ctx=ctxFake){
        let statusModel=await this.validate(ctx.headers["docleverversion"])
        await statusModel.remove({
            _id:id
        })

    }


    async list (id:string,ctx=ctxFake){
        let statusModel=await this.validate(ctx.headers["docleverversion"])
        let query:any={
            project:id
        }
        if(ctx.headers["docleverversion"])
        {
            query.version=ctx.headers["docleverversion"]
        }
        let arr:InstanceType<StatusModel>[]|InstanceType<StatusVersionModel>[]=await statusModel.find(query,null,{
            sort:"-createdAt"
        })
        return arr

    }


    async exportJSON (id:string,ctx=ctxFake){
        let statusModel=await this.validate(ctx.headers["docleverversion"])
        let ret=await statusModel.findOne({
            _id:id
        });
        if(!ret)
        {
            throw e.statusNotFound;
            return;
        }
        var obj={
            name:ret.name,
            data:ret.data,
            flag:"SBDoc",
            id:ret.id
        }
        let content=JSON.stringify(obj);
        let headers:any={
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\''+encodeURIComponent(ret.name)+".json",
            "Transfer-Encoding": "chunked",
            "Expires":0,
            "Cache-Control":"must-revalidate, post-check=0, pre-check=0",
            "Content-Transfer-Encoding":"binary",
            "Pragma":"public",
        };
        return {headers,content}

    }


    async importJSON (projectId:string,json:string,ctx=ctxFake){
        let statusModel=await this.validate(ctx.headers["docleverversion"])
        let obj;
        try {
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
            _id:projectId
        })
        if(!objProject)
        {
            throw e.projectNotFound;
            return;
        }
        let newObj:any={
            name:obj.name,
            project:objProject._id,
            data:obj.data,
            id:obj.id
        }
        if(ctx.headers["docleverversion"])
        {
            newObj.version=ctx.headers["docleverversion"]
        }
        let ret:InstanceType<StatusModel>|InstanceType<StatusVersionModel>=await statusModel.create(newObj);
        return ret

    }
}

export=new StatusDao;









