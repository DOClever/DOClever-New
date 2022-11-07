import db1=require("../util/db");
import {TeamModel} from "./types"

var dbManage=new TeamModel().getModelForClass(TeamModel,{
    schemaOptions:{
        timestamps:true,
        collection:"teams"
    },
    existingConnection:db1
})
export=dbManage;