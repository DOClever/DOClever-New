import db1=require("../util/db");
import {StatusVersionModel} from "./types"

var dbManage=new StatusVersionModel().getModelForClass(StatusVersionModel,{
    schemaOptions:{
        timestamps:true,
        collection:"statusversions"
    },
    existingConnection:db1
})
export=dbManage;