import handle=require("./node/handle");
import electron = require('electron')
import http=require("http")
const BrowserWindow = electron.BrowserWindow
export var nodeSingle=<{
    api:InstanceType<typeof handle>,
    version:string,
    debug:boolean,
    appPath:string,
    mainWindow:InstanceType<typeof BrowserWindow>,
    pathEnv:string
}>{}
export var webSingle=<{
    rootVue:any,
    desktopVersion:string,
    debug:boolean,
    remote:typeof electron.remote,
    api:{
        net(method,url,headers,body):Promise<{
            data: any,
            status: number,
            header: any
        }>
        mock:{
            list:{
                name:string,
                state:number,
                id:string,
                server:http.Server,
                port:number,
                realUrl:string
            }[],
            start(id,name,mockUrl,realUrl,port):boolean,
            stop(id),
            clear(),
            remove(id)
        },
        encode:{
            param(obj,bKey):string,
            token(token):string
        },
        clipboard:{
            copyText(content)
        },
        util:{
            goUrl(url)
        },
        update:{
            checkIfNeededUpdate(id,remoteVersion):Promise<boolean>,
            updateEnv(id,url):Promise<string>,
            getProcess(sender,val):Promise<void>,
            handlePluginInfo(envId,userId):Promise<any>,

        },
        path:{
            getEnvPath(id):string,
            delEnv(id):Promise<void>,
            delPlugin(member):Promise<any[]>
            getLoginPath():string
        },
        computeName():string,
        macAddress():Promise<string>,
        cookie:{
            get(key):string,
            set(key,value,remember):string,
            remove(key):string
        }
    }
}>{}


