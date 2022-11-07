import e=require("../util/error.json");
import util=require("../util/util");
import example=require("../model/exampleModel")
import {api, user} from "../routes/generateParams";
import exampleApi = require("../../Common/routes/example")
import {keys} from "../../Common/transform";
import {ExampleModel} from "../model/types";
import {InstanceType} from "typegoose";
class ExampleDao {
    async saveExample (name:string,projectId:string,interfaceId:string,paramId:string,param:string,id:string,docleverVersion:string,userId:string){
        let query=<{
            name:string,
            project:string,
            interface:string,
            paramId:string,
            param:any,
            interfaceType?:string,
            owner?:string
        }>{
            name:name,
            project:projectId,
            interface:interfaceId,
            paramId:paramId,
            param:JSON.parse(param)
        }
        let obj:InstanceType<ExampleModel>;
        if(id)
        {
            obj=await example.findOneAndUpdate({
                _id:id
            },query,{
                new:true
            })
        }
        else
        {
            if(docleverVersion)
            {
                query.interfaceType="InterfaceVersion";
            }
            query.owner=userId;
            obj=await example.create(query);
        }
        return obj

    }
    async exampleInfo (id:string){

        let obj=await example.findOne({
            _id:id
        });
        if(!obj)
        {
            throw e.exampleNotFound;
        }
        return obj
    }


    async exampleList (interfaceId:string,paramId:string){

        let query={
            interface:interfaceId,
            paramId:paramId
        }
        let arr=await example.find(query,"name createdAt",{
            sort:"-createdAt"
        });
        return arr

    }


    async removeExample (id:string){

        await example.remove({
            _id:id
        });

    }


    async exampleAllList (interfaceId:string){

        let arr=await example.find({
            interface:interfaceId
        },"name paramId");
        let obj=<{
            [id:string]:InstanceType<ExampleModel>[]
        }>{};
        arr.forEach(function (o) {
            let id=o.paramId;
            if(obj[id])
            {
                obj[id].push(o);
            }
            else
            {
                obj[id]=[o];
            }
        })
        return obj
    }
}


export=new ExampleDao();
