import electron = require("electron")
const app = electron.app
const session = electron.session
const menu = electron.Menu
const BrowserWindow = electron.BrowserWindow
import path = require('path')
import url = require('url')
import electronUpdate=require("electron-updater")
const update=electronUpdate.autoUpdater;
const dialog=electron.dialog;
import config=require("./package.json");
import handle=require("./node/handle")
import {nodeSingle} from "./global";
let apiElectron=new handle(electron)
nodeSingle.api=apiElectron;
nodeSingle.version=config.version;
if(config.debug)
{
    require("./hmr");
}
if(!nodeSingle.debug)
{
    nodeSingle.appPath=__dirname;
}
let mainWindow:InstanceType<typeof BrowserWindow>;
let lock=app.requestSingleInstanceLock()
if (!lock) {
    app.quit()
} else
{
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
}

let updateUrl=config.update;
update.setFeedURL(updateUrl);
update.on('error', function (error) {
    const options = {
        type: 'error',
        title: 'DOClever',
        message: "更新出错",
        buttons: ["确定"]
    }
    dialog.showMessageBox(options)
});
update.on('update-available', function (info) {
    const options = {
        type: 'info',
        title: 'DOClever',
        message: `发现最新版本:${info.version}\n${info.remark}`,
        buttons: ["下载","取消"]
    }
    // dialog.showMessageBox(options as any,function (index) {
    //     if(index==0)
    //     {
    //         update.downloadUpdate();
    //     }
    // })
});
update.on('update-not-available', function (info) {
    const options = {
        type: 'info',
        title: 'DOClever',
        message: "已经是最新版本",
        buttons: ["确定"]
    }
    dialog.showMessageBox(options)
});
update.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    const options = {
        type: 'info',
        title: 'DOClever',
        message: "下载完成，是否安装更新!",
        buttons: ["是","否"]
    }
    // dialog.showMessageBox(options,function (index) {
    //     if(index==0)
    //     {
    //         update.quitAndInstall();
    //     }
    // })
});
function createWindow () {
    let size=electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: size.width,
        height: size.height,
        webPreferences:{
            webSecurity:false,
            nodeIntegration: true
        }
     })
    mainWindow.loadURL(url.format({
        pathname: nodeSingle.debug?"localhost:8081/web/basic/login/login.html":path.join(__dirname, './web/basic/login/login.html'),
        protocol: nodeSingle.debug?'http:':"file:",
        slashes: true
    }))
    if(nodeSingle.debug)
    {
        mainWindow.webContents.openDevTools()
    }
    electron.globalShortcut.register('CommandOrControl+Alt+SHIFT+S+X', function () {
        BrowserWindow.getFocusedWindow().webContents.openDevTools()
    })
    electron.globalShortcut.register('CommandOrControl+Alt+SHIFT+R', function () {
        BrowserWindow.getFocusedWindow().webContents.reload();
    })
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    mainWindow.webContents.on( 'new-window', function (event,url,fname,disposition,options) {
        let childWindow;
        childWindow = new BrowserWindow({
            width: size.width,
            height: size.height,
            webPreferences: {webSecurity:false,}
        });
        childWindow.loadURL(url);
        event.preventDefault();
    });
    nodeSingle.mainWindow=mainWindow;
    let template=[
        {
            label:"DOClever",
            submenu:[
                {
                    label:"当前版本:"+config.version
                },
                {
                   label:"检查更新",
                   click:function () {
                       update.autoDownload=false;
                       update.checkForUpdates();
                   }
            },
            {
                 label:"退出",
                 click:function () {
                     app.quit();
                 }
            }]
        },
        {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }]
    const m = menu.buildFromTemplate(template as any)
    menu.setApplicationMenu(m)
}
app.on('ready', createWindow)
app.on('window-all-closed', function () {
    app.quit()
})
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

