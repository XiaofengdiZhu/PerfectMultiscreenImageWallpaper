var timeoutForDoubleTrigger = null;
var boolForDoubleTrigger = false;

//控制数字范围
function Clamp(num, min, max) {
    if (min > max) {
        var temp = max;
        max = min;
        min = temp;
    }
    return Math.max(Math.min(num, max), min);
}

//将例如“100px”、“50%”的string转换成不带px的数字，width、left、right时XorY true，height、top、bottom时XorY false
function stringToPx(string, element, XorY) {
    if (typeof string === "number") {
        return string;
    } else if (/px/.test(string)) {
        return parseInt(string, 10);
    }
    else if (/%/.test(string)) {
        if (XorY) {
            return parseFloat(string) / 100 * element.parentNode.clientWidth;
        } else {
            return parseFloat(string) / 100 * element.parentNode.clientHeight;
        }
    } else return 0;
}

//time ms内执行两次该函数执行function
function DoubleTrigger(func, time) {
    if (boolForDoubleTrigger) {
        boolForDoubleTrigger = false;
        clearTimeout(timeoutForDoubleTrigger);
        func();
    } else {
        boolForDoubleTrigger = true;
        timeoutForDoubleTrigger = setTimeout(function () {
            boolForDoubleTrigger = false;
        }, time);
    }
}

function generateDataTextURL(str) {
    return "data:text/plain;base64," + $.base64.btoa(str);
}

$.base64.utf8encode = true;
function generateDataHtmlURL(link){
    return "data:text/html;base64," + $.base64.btoa("<html><head><meta charset=\"utf-8\"><title>&#x914D;&#x7F6E;&#x5BFC;&#x51FA;</title></head><body><a href=\"" + generateDataTextURL(link) + "\" download=\"user-config.js\">点我导出</a></body></html>");
}

function RGB2Hex(color) {
    var rgb = color.split(',');
    return ("#" + ((1 << 24) + (parseInt(rgb[0].split('(')[1]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2].split(')')[0])).toString(16).slice(1));
}

Array.prototype.contains = function ( needle ) {
    for (i in this) {
        if (this[i] == needle) return true;
    }
    return false;
};

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};