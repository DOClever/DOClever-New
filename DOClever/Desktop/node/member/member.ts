import path=require("path");
import electron=require("electron")
    const ipc=electron.ipcMain;
import fs=require("fs-extra");
import crypto=require("crypto-js");
class Member {
    encodeToken (token) {
        let wordArray = crypto.enc.Utf8.parse(token);
        let str = crypto.enc.Base64.stringify(wordArray);
        str+=Math.floor(Math.random() * (99 - 10 + 1) + 10);
        str=str.split("").reverse().join("");
        return str;
    }
}
export=Member;
