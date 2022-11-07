import path=require("path");
import {webSingle} from "../global";
var fs,decompress,getmac,rm,mock;
if(location.href.startsWith("http"))
{
    webSingle.debug=true;
    let curPath="/Users/sunxin/doclever-new/DOClever/Desktop";
    fs=require(path.join(curPath,"./node_modules/fs-extra"));
    decompress =require(path.join(curPath,"./node_modules/decompress"));
    getmac =require(path.join(curPath,"./node_modules/getmac"));
    rm =require(path.join(curPath,"./node_modules/rimraf"));
    mock=require(path.join(curPath,"web/console/mock/mock"));
}
else
{
    fs=require("fs-extra");
    decompress =require("decompress");
    getmac=require("getmac")
    rm=require("rimraf")
    mock=require("../web/console/mock/mock")
}
console.log(__dirname);
import electron=require('electron')

const remote=electron.remote;
webSingle.remote=remote;
webSingle.desktopVersion=remote.getGlobal("version");
const remoteApi=remote.getGlobal("api");
const ipc=electron.ipcRenderer;
const app=remote.app;
const shell=electron.shell;
const clipboard = electron.clipboard;
const pathEnv=path.join(app.getPath("home"),"DOClever-Desktop")
webSingle.api={
    net:async function (method,url,headers,body) {
        function getHost(url) {
            var a = window.document.createElement('a');
            a.href = url;
            let obj:any={
                protocol: a.protocol,
                host: a.hostname,
                port: a.port,
            };
            return obj.protocol+"//"+obj.host+((obj.port && obj.port!=80)?(":"+obj.port):"");
        }
        let host=getHost(url);
        let request=remote.getGlobal("api").request;
        let fs=remote.getGlobal("api").fs;
        if(!headers)
        {
            headers={};
        }
        var objReq:any={
            url:url,
            method:method,
            encoding: null
        }
        if((method=="POST" || method=="PUT" || method=="PATCH") && body)
        {
            if(typeof(body)=="string" || (body instanceof ArrayBuffer))
            {
                var bFind=false;
                for(var key in headers)
                {
                    if(key.toLowerCase()=="content-type")
                    {
                        bFind=true;
                        break;
                    }
                }
                if(!bFind)
                {
                    if(typeof(body)=="string")
                    {
                        var bJson=true;
                        try {
                            JSON.parse(body);
                        }
                        catch(e) {
                            bJson=false;
                        }
                        if(bJson)
                        {
                            headers["content-type"]="application/json"
                        }
                        else
                        {
                            headers["content-type"]="text/plain";
                        }
                    }
                }
                objReq.body=body;
            }
            else
            {
                var bEncode=false,bFind=false,bFile=false;
                for(let key in body)
                {
                    let val=body[key];
                    if(typeof(val)=="object" && (val instanceof File))
                    {
                        bFile=true;
                        body[key]={
                            value:await fs.readFile(val.path),
                            options:{
                                filename:val.name,
                                contentType:val.type
                            }
                        };
                    }
                }
                if(bFile)
                {
                    for(var key in headers)
                    {
                        if(key.toLowerCase()=="content-type")
                        {
                            headers[key]="multipart/form-data";
                        }
                    }
                    objReq.formData=body;
                }
                else
                {
                    for(var key in headers)
                    {
                        if(key.toLowerCase()=="content-type")
                        {
                            bFind=true;
                            if(headers[key].toLowerCase()=="application/x-www-form-urlencoded")
                            {
                                bEncode=true;
                                break;
                            }
                        }
                    }
                    if(bEncode || !bFind)
                    {
                        body=this.encode.param(body,1);
                        if(!bFind)
                        {
                            headers["content-type"]="application/x-www-form-urlencoded"
                        }
                    }
                    objReq.form=body;
                }
            }
        }
        objReq.headers=headers;
        let strCookie="";
        for(let key in headers)
        {
            if(key.toLowerCase()=="cookie")
            {
                strCookie=headers[key];
                break;
            }
        }
        let cookie=await remoteApi.cookie.all(host);
        if(strCookie)
        {
            cookie+=";"+strCookie;
        }
        headers["cookie"]=cookie;
        let userAgent="",userAgentKey="";
        for(let key in headers)
        {
            if(key.toLowerCase()=="user-agent")
            {
                userAgent=headers[key];
                userAgentKey=key;
                break;
            }
        }
        if(userAgent)
        {
            userAgent+=" DOClever";
            headers[userAgentKey]=userAgent;
        }
        else
        {
            headers["user-agent"]="DOClever"
        }
        return new Promise(function (resolve,reject) {
            request(objReq,function (err,res,resBody) {
                if(err)
                {
                    var obj={
                        data:err.message,
                        status:0,
                        header:{},
                    }
                    resolve(obj);
                }
                else
                {
                    var reader = new FileReader();
                    let resObj;
                    let content=resBody;
                    if(/image\//i.test(res.headers["content-type"]))
                    {
                        resObj=new Blob([content],{
                            type:res.headers["content-type"]
                        });
                    }
                    else
                    {
                        content=content.toString("utf8");
                        try
                        {
                            resObj=JSON.parse(content);
                        }
                        catch (err)
                        {
                            resObj=content;
                        }
                    }
                    let cookies = res.headers["set-cookie"];
                    if(cookies)
                    {
                        for (let index in cookies) {
                            let cookie = cookies[index];
                            let realOfCookie = cookie.split(";")[0];
                            let arrCookie=realOfCookie.split("=");
                            remoteApi.cookie.set(arrCookie[0],arrCookie[1],0,host)
                        }
                    }
                    let obj={
                        data:resObj,
                        status:res.statusCode,
                        header:res.headers,
                    }
                    resolve(obj);
                }
            })
        })
    },
    mock:{
        list:[],
        start:function (id,name,mockUrl,realUrl,port) {
            let objMock=null;
            for(let o of this.list)
            {
                if(o.id==id)
                {
                    objMock=o;
                    objMock.realUrl=realUrl;
                    objMock.port=port;
                    break;
                }
            }
            if(objMock)
            {
                try
                {
                    objMock.server.listen(objMock.port);
                    objMock.state=1;
                    return true;
                }
                catch (err)
                {
                    return false;
                }
            }
            else
            {
                let server=mock(mockUrl,realUrl,Number(port))
                if(server)
                {
                    let obj={
                        name:name,
                        state:1,
                        id:id,
                        server:server,
                        port:Number(port),
                        realUrl:realUrl
                    }
                    this.list.push(obj);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        },
        stop:function (id) {
            for(let o of this.list)
            {
                if(o.id==id && o.state==1)
                {
                    o.server.close();
                    o.state=0;
                }
            }
        },
        clear:function () {
            for(let o of this.list)
            {
                o.server.close();
            }
            this.list=[];
        },
        remove:function (id) {
            for(let index=0;index<this.list.length;index++)
            {
                let o=this.list[index];
                if(o.id==id)
                {
                    o.server.close();
                    this.list.splice(index,1);
                    break;
                }
            }
        }
    },
    encode:{
        param:function (obj,bKey) {
            var arr=[];
            for(var key in obj)
            {
                arr.push((bKey?encodeURIComponent(key):key)+"="+encodeURIComponent(obj[key]));
            }
            return arr.join("&");
        },
        token:function (token) {
            return remoteApi.member.encodeToken(token);
        }
    },
    clipboard:{
        copyText:function (content) {
            clipboard.writeText(content);
        }
    },
    update:{
        checkIfNeededUpdate:async function (id,remoteVersion) {
            let p=path.join(pathEnv,id);
            let pVer=path.join(p,"ver");
            if(!await fs.exists(pVer))
            {
                return true;
            }
            let verContent=(await fs.readFile(pVer)).toString();
            if(verContent!=remoteVersion)
            {
                return true;
            }
            return false;
        },
        updateEnv:async function(id,url)
        {
            let p=path.join(pathEnv,id);
            if(!await fs.exists(p))
            {
                await fs.mkdir(p);
            }
            ipc.removeAllListeners("updateEnvProcess");
            ipc.on("updateEnvProcess",this.getProcess);
            //global.rootVue.$emit("startUpdate")
            let zip=await remoteApi.update.updateEnv(id,url);
            //global.rootVue.$emit("updateUnzip")
            await fs.remove(path.join(zip,"..","content"));
            await decompress(zip,path.join(zip,".."));
            await fs.unlink(zip);
            //global.rootVue.$emit("finishUpdate")
            return path.join(zip,"..");
        },
        getProcess:async function (sender,val) {
            //global.rootVue.$emit("updateProcess",val)
        },
        handlePluginInfo:async function(envId,userId)
        {
            let p=path.join(pathEnv,envId,"plugin");
            if(!(await fs.exists(p)))
            {
                await fs.mkdir(p);
            }
            p=path.join(p,userId);
            let objPlugin={};
            if(!(await fs.exists(p)))
            {
                await fs.mkdir(p);
            }
            else
            {
                let dirs=await fs.readdir(p);
                for(let o of dirs)
                {
                    let p1=path.join(p,o);
                    let stat=await fs.stat(p1);
                    if(stat.isDirectory())
                    {
                        let p2=path.join(p1,"ver");
                        if(await fs.exists(p2))
                        {
                            let verContent=(await fs.readFile(p2)).toString();
                            objPlugin[o]=verContent;
                        }
                    }
                }
            }
            return objPlugin;
        }
    },
    util:{
        goUrl:function (url) {
            shell.openExternal(url);
        }
    },
    path:{
        getLoginPath:function () {
            return path.join(pathEnv,"web/basic/login/login.html")
        },
        getEnvPath:function (id) {
            return path.join(pathEnv,id);
        },
        delEnv:function (id) {
            let p=path.join(pathEnv,id);
            return new Promise(function (resolve) {
                rm(p,function () {
                    resolve();
                })
            })
        },
        delPlugin:async function (member) {
            let p=pathEnv;
            let arr=await fs.readdir(p);
            let ret=[];
            for(let o of arr)
            {
                let p1=path.join(p,o);
                let stat=await fs.stat(p1);
                if(stat.isDirectory())
                {
                    let p=path.join(p1,"plugin",member);
                    if(await fs.exists(p))
                    {
                        ret.push(new Promise(function (resolve) {
                            rm(p,function () {
                                resolve();
                            })
                        }))
                    }
                }
            }
            return Promise.all(ret);
        }
    },
    computeName:function () {
        return require("os").hostname();
    },
    macAddress:function () {
        return new Promise<string>(function (resolve,reject) {
            getmac.getMac(function (err,mac) {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve(mac);
                }
            })
        })
    },
    cookie:{
        get:function (key) {
            return remoteApi.cookie.get(key);
        },
        set:function (key,value,remember) {
            return remoteApi.cookie.set(key,value,remember);
        },
        remove:function (key) {
            return remoteApi.cookie.remove(key);
        }
    }
};
