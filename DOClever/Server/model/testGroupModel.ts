import db1=require("../util/db");
import {TestGroupModel} from "./types"

var dbManage=new TestGroupModel().getModelForClass(TestGroupModel,{
    schemaOptions:{
        timestamps:true,
        collection:"testgroups"
    },
    existingConnection:db1
})
export=dbManage;