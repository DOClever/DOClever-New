import db1=require("../util/db");
import {TeamGroupModel} from "./types"

var dbManage=new TeamGroupModel().getModelForClass(TeamGroupModel,{
    schemaOptions:{
        timestamps:true,
        collection:"teamgroups"
    },
    existingConnection:db1
})
export=dbManage;