import db1=require("../util/db");
import {VersionModel} from "./types"

var dbManage=new VersionModel().getModelForClass(VersionModel,{
    schemaOptions:{
        timestamps:true,
        collection:"versions"
    },
    existingConnection:db1
})
export=dbManage;