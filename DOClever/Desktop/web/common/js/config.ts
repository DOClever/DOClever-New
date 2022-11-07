import {webSingle} from "../../../global";

let url=sessionStorage.getItem("baseUrl")
export={
    baseUrl:(url && url.startsWith("http://"))?url:"http://"+url,
    host:(url && url.startsWith("http://"))?url:"http://"+url,
    online:webSingle.debug?"http://localhost:8090":"http://doclever.cn:8090",
    electron:function () {
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf(' electron/') > -1) {
            return true
        }
        else
        {
            return false
        }
    }()
}
