import db1=require("../util/db");
import {DocGroupModel} from "./docGroupTypes"

var dbManage=new DocGroupModel().getModelForClass(DocGroupModel,{
    schemaOptions:{
        timestamps:true,
        collection:"docgroups"
    },
    existingConnection:db1
})
export=dbManage;