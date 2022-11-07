import db1=require("../util/db");
import {PollModel} from "./types"

var dbManage=new PollModel().getModelForClass(PollModel,{
    schemaOptions:{
        timestamps:true,
        collection:"polls"
    },
    existingConnection:db1
})
export=dbManage;