import Router=require("koa-router");
import checkParam=require("./checkParam");
import path=require("path")
import fs=require("fs-extra")
let root=new Router();
let arrRoutes=[];
(async function()
{
    let dirs=await fs.readdir(__dirname);
    for(let o of dirs)
    {
        let p1=path.join(__dirname,o);
        let stat=await fs.stat(p1);
        if(stat.isDirectory())
        {
            let subDirs=await fs.readdir(path.join(__dirname,o))
            let bExist=false
            for(let dir of subDirs)
            {
                if(dir.startsWith(`${o}.`) && o!="proxy" && o!="mock")
                {
                    bExist=true
                    break
                }
            }
            if(bExist)
            {
                arrRoutes.push(o)
            }
        }
    }
    for(let o of arrRoutes) {
        let route=await checkParam(o)
        root.use(`/${o}`,route.routes(),route.allowedMethods())
    }
    // root.use("/userModel",checkFormDataUser(path.join(con.filePath,"img")));
    // root.use("/userModel",await checkParam("userModel"));
    // root.use("/userModel",checkUser);
    // root.use("/project",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("project"),checkUser);
    // root.use("/group",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("group"),checkUser);
    // root.use("/interface",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("interface"),checkUser);
    // root.use("/status",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("status"),checkUser);
    // root.use("/test",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("test"),checkUser);
    // root.use("/team",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("team"),checkUser);
    // root.use("/version",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("version"),checkUser);
    // root.use("/poll",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("poll"),checkUser);
    // root.use("/article",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("article"),checkUser);
    // root.use("/message",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("message"),checkUser);
    // root.use("/template",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("template"),checkUser);
    // root.use("/example",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("example"),checkUser);
    // root.use("/doc",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("doc"),checkUser);
    // root.use("/command",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("command"),checkUser);
    // root.use("/admin",checkFormDataUser(path.join(con.filePath,"img")),await checkParam("admin"),checkAdmin);
    // root.use("/mock",checkFormDataUser(path.join(con.filePath,"temp")),mock);
})()
export=root;