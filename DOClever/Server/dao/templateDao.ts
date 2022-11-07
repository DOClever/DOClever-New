import e=require("../util/error.json");
import util=require("../util/util");
import template=require("../model/templateModel")
import {api, user} from "../routes/generateParams";
import templateApi = require("../../Common/routes/template")
import {keys} from "../../Common/transform";
import {InstanceType} from "typegoose";
import {TemplateModel} from "../model/types";
class TemplateDao {


    async saveTemplate (id:string,name:string,project:string,method:string,param:string,url:string,remark:string,docleverVersion:string){

        let query:any={
            name:name,
            method:method,
            param:JSON.parse(param),
            url:url?url:"",
            remark:remark?remark:"",
            project:project
        };
        if(docleverVersion)
        {
            query.version=docleverVersion
        }
        let ret:InstanceType<TemplateModel>;
        if(id)
        {
            ret=await template.findOneAndUpdate({
                _id:id
            },query,{
                new:true
            })
        }
        else
        {
            ret=await template.create(query)
        }
        return ret

    }


    async templateInfo (id:string){

        let obj=await template.findOne({
            _id:id
        });
        if(!obj)
        {
            throw e.templateNotFound;
        }
        return obj

    }


    async templateList (project:string,docleverVersion:string){

        let query:any={
            project:project
        }
        if(docleverVersion)
        {
            query.version=docleverVersion
        }
        let arr=await template.find(query,"name createdAt",{
            sort:"-createdAt"
        });
        return arr

    }


    async removeTemplate (id:string){
        await template.remove({
            _id:id
        });

    }
}


export=new TemplateDao;
