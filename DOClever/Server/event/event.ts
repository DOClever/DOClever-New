/**
 * Created by sunxin on 2017/5/19.
 */
import schedule = require("node-schedule");
import moment=require("moment");
import fs=require("fs");
import temp=require("../model/tempModel");
import poll=require("../model/pollModel");
import info=require("../model/infoModel");
import con=require("../../config.json");
import util=require("../util/util");
import blue=require("bluebird");
import path = require('path');
var rule = new schedule.RecurrenceRule();
rule.minute = 30;
blue.promisifyAll(fs);
var j = schedule.scheduleJob(rule,async function(){
    try
    {
        let arr=await temp.find();
        for(let obj of arr)
        {
            let newDate=moment(obj.createdAt).add(30,"m");
            if(moment().isAfter(newDate))
            {
                let pathName=path.join(con.filePath,"temp",obj.name+".zip");
                // @ts-ignore
                if(await fs.existsAsync(pathName))
                {
                    // @ts-ignore
                    await fs.unlinkAsync(pathName);
                }
                await obj.remove();
            }
        }
    }
    catch (err)
    {
        console.log(err);
    }


});

schedule.scheduleJob("0 0 0 * * *",(async function () {
    try
    {
        await util.createStatistic();
    }
    catch (err)
    {
        console.log(err);
    }
}));

var j1=schedule.scheduleJob("0 * * * *",(async function () {
    try
    {
        let date=moment();
        let weekDay=date.weekday()-1;
        let hour=date.hour();
        let arr=await poll.find({
            date:weekDay,
            time:hour
        },null);
        await util.runPoll(arr);
        let objInfo=await info.findOne();
        if(objInfo.dbName.hours.indexOf(hour)>-1)
        {
            await util.backup(objInfo.db,objInfo.version)
        }
    }
    catch (err)
    {
        console.log(err);
    }
}));
















