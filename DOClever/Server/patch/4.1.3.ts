

import admin=require("../model/adminModel")
export=async function () {
    let obj=await admin.findOne({
        name:"DOClever"
    });
    if(!obj)
    {
        await admin.create({
            name:"DOClever",
            password:"DOClever"
        });
    }
}