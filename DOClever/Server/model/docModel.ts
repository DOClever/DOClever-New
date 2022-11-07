import db1=require("../util/db");
import {DocModel} from "./docTypes"

var dbManage=new DocModel().getModelForClass(DocModel,{
    schemaOptions:{
        timestamps:true,
        collection:"docs"
    },
    existingConnection:db1
})
export=dbManage;