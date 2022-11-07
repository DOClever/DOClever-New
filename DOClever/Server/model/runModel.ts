import db1=require("../util/db");
import {RunModel} from "./types"

var dbManage=new RunModel().getModelForClass(RunModel,{
    schemaOptions:{
        timestamps:true,
        collection:"runs"
    },
    existingConnection:db1
})
export=dbManage;