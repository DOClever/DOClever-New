import mongoose = require('mongoose');
import db1=require("../util/db");
import {InfoModel} from "./types"

var dbManage=new InfoModel().getModelForClass(InfoModel,{
    schemaOptions:{
        timestamps:true,
        collection:"infos"
    },
    existingConnection:db1
})
export=dbManage;