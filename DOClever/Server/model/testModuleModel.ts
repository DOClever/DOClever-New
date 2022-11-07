import db1=require("../util/db");
import {TestModuleModel} from "./types"

var dbManage=new TestModuleModel().getModelForClass(TestModuleModel,{
    schemaOptions:{
        timestamps:true,
        collection:"testmodules"
    },
    existingConnection:db1
})
export=dbManage;