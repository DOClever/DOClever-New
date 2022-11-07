import db1=require("../util/db");
import {TemplateModel} from "./types"

var dbManage=new TemplateModel().getModelForClass(TemplateModel,{
    schemaOptions:{
        timestamps:true,
        collection:"templates",
        strict:false
    },
    existingConnection:db1
})
export=dbManage;