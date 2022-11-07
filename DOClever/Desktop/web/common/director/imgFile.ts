/**
 * Created by sunxin on 16/8/29.
 */
function getUrl(el,file) {
    if(!file)
    {
        return null;
    }
    // @ts-ignore
    if(el.img && document.getElementById(el.img).src.match(/^blob\:/i))
    {
        // @ts-ignore
        el.destoryFunc(document.getElementById(el.img).src);
    }
    var url = el.createFunc(file);
    return url;
}
var obj={
    bind:function (el,binding) {
        // @ts-ignore
        if (window.createObjectURL != undefined) { // basic
            // @ts-ignore
            el.createFunc = window.createObjectURL;
            // @ts-ignore
            el.destoryFunc=window.revokeObjectURL;
        }  else if (window.URL != undefined) { // mozilla(firefox)
            el.createFunc = window.URL.createObjectURL;
            el.destoryFunc=window.URL.revokeObjectURL;
        } else if (window.webkitURL != undefined) { // webkit or chrome
            el.createFunc = window.webkitURL.createObjectURL;
            el.destoryFunc=window.webkitURL.revokeObjectURL;
        }
        el.img=binding.value;
        el.onchange=function () {
            var url=getUrl(el,el.files[0]);
            if(el.img && url)
            {
                // @ts-ignore
                document.getElementById(el.img).src=url;
            }
        }
    },
    unbind:function (el) {
        el.onchange=null;
        // @ts-ignore
        if(el.img && document.getElementById(el.img) && document.getElementById(el.img).src.test(/^blob\:/i))
        {
            // @ts-ignore
            el.destoryFunc(document.getElementById(el.img).src);
        }
    },
    update:function (el) {
        if(el.img)
        {
            return;
        }
        setTimeout(function () {
            el.img=el;
        },100);
    }
}

export=obj;