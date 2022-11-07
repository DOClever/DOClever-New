/**
 * Created by sunxin on 16/4/15.
 */
import mongoose = require('mongoose');
import data=require("./../../config.json");
import {Connection} from "mongoose";
require("../third/schemaExtend");
var db:Connection & {
    then: Promise<Connection>["then"];
    catch: Promise<Connection>["catch"];
}=mongoose.createConnection(data.db,{
    keepAlive: true,
    connectTimeoutMS: 30000,
    useNewUrlParser:true
});

export=db;


