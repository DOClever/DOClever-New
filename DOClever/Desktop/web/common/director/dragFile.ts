/**
 * Created by sunxin on 2017/5/21.
 */
const _$=require("../js/common.js")
var obj={
    bind:function (el,binding,vnode) {
        el.draggable=true;
        var area=el.getElementsByTagName("textarea")[0];
        area.placeholder+="(支持将文件拖入输入框内)"
        el.addEventListener("dragenter", function(e){
            area.style.backgroundColor = 'rgba(88,183,255,0.6)';
            e.stopPropagation();
            e.preventDefault();
        }, false);
        el.addEventListener("dragleave", function(e){
            area.style.backgroundColor = 'white';
        }, false);
        el.addEventListener("dragover", function(e){
            e.stopPropagation();
            e.preventDefault();
        }, false);
        el.addEventListener("drop", function(e){
            area.style.backgroundColor = 'white';
            e.stopPropagation();
            e.preventDefault();
            var file=e.dataTransfer.files[0];
            if(file.type.indexOf("text")==-1 && file.type.indexOf("json")==-1 && file.type!="")
            {
                _$.tip("文件类型不正确",0);
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                vnode.context[binding.value]=reader.result;
            };
            reader.onerror=function () {
                _$.tip("读取文件错误",0);
            }
            reader.readAsText(file);
        }, false);
    },
    unbind:function (el) {

    },
    update:function (el,binding) {

    }
}

export=obj;
