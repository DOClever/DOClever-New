import db1=require("../util/db");
import {DocProjectModel} from "./types"

var dbManage=new DocProjectModel().getModelForClass(DocProjectModel,{
    schemaOptions:{
        timestamps:true,
        collection:"docprojects"
    },
    existingConnection:db1
})
export=dbManage;