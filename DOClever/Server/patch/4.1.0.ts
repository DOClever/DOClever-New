

import admin=require("../model/adminModel")
export=async function () {
    await admin.create({
        name:"DOClever",
        password:"DOClever"
    });
}