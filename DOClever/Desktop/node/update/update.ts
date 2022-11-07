import path=require("path");
import electron=require("electron")
import {nodeSingle} from "../../global";
const ipc=electron.ipcMain;
class Update {
    async updateEnv (id,url) {
        let webContent=nodeSingle.mainWindow.webContents;
        let mainWindow=nodeSingle.mainWindow;
        return new Promise(function (resolve,reject) {
            webContent.session.once('will-download', (e, item) => {
                const totalBytes = item.getTotalBytes();
                const filePath = path.join(nodeSingle.pathEnv,id,item.getFilename());
                item.setSavePath(filePath);
                item.on('updated', () => {
                    webContent.send("updateEnvProcess",item.getReceivedBytes() / totalBytes)
                });
                item.on('done', (e, state) => {
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
export=Update;
