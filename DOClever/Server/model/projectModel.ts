import db1=require("../util/db");
import {ProjectModel} from "./types"

var dbManage=new ProjectModel().getModelForClass(ProjectModel,{
    schemaOptions:{
        timestamps:true,
        collection:"projects"
    },
    existingConnection:db1
})
export=dbManage;