import db1=require("../util/db");
import {StatisticModel} from "./types"

var dbManage=new StatisticModel().getModelForClass(StatisticModel,{
    schemaOptions:{
        timestamps:true,
        collection:"statistics"
    },
    existingConnection:db1
})
export=dbManage;