import path=require("path");
import electron=require("electron")
const ipc=electron.ipcMain;
import fs=require("fs-extra");
import {nodeSingle} from "../../global";
class Cookie {
    async all (url) {
        var _this=this;
        let cookies=await nodeSingle.mainWindow.webContents.session.cookies.get({url:url?url:"http://localhost"})
        let str="";
        for(let o of cookies)
        {
            str+=o.name+"="+o.value+";"
        }
        return str
    }
    async get (key,url) {
        var _this=this;
        let cookies=await nodeSingle.mainWindow.webContents.session.cookies.get({url:url?url:"http://localhost"})
        for(let o of cookies)
        {
            if(o.name==key)
            {
                return o.value;
            }
        }
    }
    async set (key,value,remember,url) {
        var _this=this;
        let obj:any={
            name:key,
            value:value,
            path:"/",
            url:url?url:"http://localhost"
        }
        if(remember)
        {
            let Days = 10000;
            let exp = new Date();
            let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
            obj.expirationDate=date;
        }
        await nodeSingle.mainWindow.webContents.session.cookies.set(obj)
    }
    async remove (key,url) {
        var _this=this;
        await nodeSingle.mainWindow.webContents.session.cookies.remove(url?url:"http://localhost","key")
    }
}
export=Cookie;
