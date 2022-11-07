import path=require("path");
import electron=require("electron")
const ipc=electron.ipcMain;
import fs=require("fs-extra");
import {nodeSingle} from "../../global";
class Plugin {
    async download (id,userId,pluginId,url) {
        let webContent=nodeSingle.mainWindow.webContents;
        let mainWindow=nodeSingle.mainWindow;
        let p=path.join(nodeSingle.pathEnv,id,"plugin",userId,pluginId);
        if(!(await fs.pathExists(p)))
        {
            await fs.mkdir(p)
        }
        return new Promise(function (resolve,reject) {
            webContent.session.on('will-download', (e, item) => {
                const totalBytes = item.getTotalBytes();
                const filePath = path.join(nodeSingle.pathEnv,id,"plugin",userId,pluginId,item.getFilename());
                item.setSavePath(filePath);
                item.on('done', (e, state) => {
                    if (!mainWindow.isDestroyed()) {
                        mainWindow.setProgressBar(-1);
                    }
                    if (state === 'interrupted') {
                        reject("下载没有完成!");
                    }
                    if (state === 'completed') {
                        resolve(filePath);
                    }
                });
            });
            webContent.downloadURL(url);
        })
    }
}
export=Plugin;
