import db1=require("../util/db");
import {StatusModel} from "./types"

var dbManage=new StatusModel().getModelForClass(StatusModel,{
    schemaOptions:{
        timestamps:true,
        collection:"status"
    },
    existingConnection:db1
})
export=dbManage;