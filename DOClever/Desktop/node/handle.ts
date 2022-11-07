import update=require("./update/update");
import plugin=require("./plugin/plugin");
import cookie=require("./cookie/cookie");
import member=require("./member/member")
import path=require("path")
import fs=require("fs-extra")
import request=require("request");
import {nodeSingle} from "../global";

class Handle {
    public update:InstanceType<typeof update>;
    public plugin:InstanceType<typeof plugin>;
    public cookie:InstanceType<typeof cookie>;
    public member:InstanceType<typeof member>;
    public request:typeof request;
    public fs:typeof fs
    constructor(electron) {
        nodeSingle.pathEnv=path.join(electron.app.getPath("home"),"DOClever-Desktop");
        if(!fs.existsSync(nodeSingle.pathEnv))
        {
            fs.mkdirSync(nodeSingle.pathEnv);
        }
        this.update=new update();
        this.plugin=new plugin();
        this.cookie=new cookie();
        this.member=new member();
        this.request=request;
        this.fs=fs
    }

}

export=Handle
