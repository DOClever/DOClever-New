import db1=require("../util/db");
import {InterfaceSnapshotModel} from "./types"

var dbManage=new InterfaceSnapshotModel().getModelForClass(InterfaceSnapshotModel,{
    schemaOptions:{
        timestamps:true,
        collection:"interfacesnapshots",
        strict:false
    },
    existingConnection:db1
})
export=dbManage;