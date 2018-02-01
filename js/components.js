var longPressWallpaperInterval = null;
var wallpapersCount = 0;
var screenWidth = parseInt($("body").width(), 10);
var screenHeight = parseInt($("body").height(), 10);
var $LayerBetweenWallpapersAndWidgets = $("#layerBetweenWallpapersAndWidgets");
var $Widgets = $("#widgets");
var $Settings = $("#settings");
var $SettingsDialog = $("#settingsDialog");
var timeoutChangeWallpapers = null;
var changedTimes = 0;
var horizonMap = {"left": 0, "center": 1, "right": 2};
var verticalMap = {"top": 0, "center": 1, "bottom": 2};

//以x,y为中心缩放图像
function ZoomWallpaper(element, scale, x, y, animate, resetPosition) {
    var newScale = Clamp(scale, 0.001, 2.5);
    var originWidth = parseInt(element.dataset.originWidth, 10);
    var originHeight = parseInt(element.dataset.originHeight, 10);
    var parentWidth = parseInt(element.parentNode.clientWidth, 10);
    var parentHeight = parseInt(element.parentNode.clientHeight, 10);
    var newWidth = originWidth * newScale;
    var correctionFactor = newWidth / parentWidth;
    if (correctionFactor < 1) {
        newScale /= correctionFactor;
        newWidth = originWidth * newScale;
    }
    var newHeight = originHeight * newScale;
    correctionFactor = newHeight / parentHeight;
    if (correctionFactor < 1) {
        newScale /= correctionFactor;
        newHeight = originHeight * newScale;
        newWidth = originWidth * newScale;
    }
    var newLeft = 0;
    var newTop = 0;
    if (resetPosition) {
        if (newWidth > parentWidth) {
            switch (generalConfig.horizon) {
                case "center":
                    newLeft = (parentWidth - newWidth) / 2;
                    break;
                case "right":
                    newLeft = parentWidth - newWidth;
                    break;
            }
        }
        if (newHeight > parentHeight) {
            switch (generalConfig.vertical) {
                case "center":
                    newTop = (parentHeight - newHeight) / 2;
                    break;
                case "bottom":
                    newTop = parentHeight - newHeight;
                    break;
            }
        }
    } else {
        newLeft = Clamp(parseFloat(element.style.marginLeft) - x * (newScale / parseFloat(element.dataset.scale) - 1), -newWidth + element.parentNode.clientWidth, 0);
        newTop = Clamp(parseFloat(element.style.marginTop) - y * (newScale / parseFloat(element.dataset.scale) - 1), -newHeight + element.parentNode.clientHeight, 0);
    }
    if (animate) $(element).animate({
        width: newWidth,
        height: newHeight,
        "margin-left": newLeft,
        "margin-top": newTop
    }, 300); else $(element).css({
        width: newWidth,
        height: newHeight,
        "margin-left": newLeft,
        "margin-top": newTop
    });
    element.dataset.scale = newScale;
}

//开始拖拽壁纸
function StartDragWallpaper(element) {
    var lastMousePos = {x: event.pageX, y: event.pageY};
    $(element).on('mousemove', function (event) {
        event.preventDefault();
        clearInterval(longPressWallpaperInterval);
        var nowMousePos = {x: event.pageX, y: event.pageY};
        $(element).css({
            "margin-left": Clamp(parseFloat(element.style.marginLeft) + nowMousePos.x - lastMousePos.x, -element.width + element.parentNode.clientWidth, 0),
            "margin-top": Clamp(parseFloat(element.style.marginTop) + nowMousePos.y - lastMousePos.y, -element.height + element.parentNode.clientHeight, 0)
        });
        lastMousePos = nowMousePos;
    });
}

//结束拖拽壁纸
function EndDragWallpaper(element) {
    $(element).off('mousemove');
}

//图像复位
function ResetWallpaper(element) {
    ZoomWallpaper(element, 0.1, 0, 0, true, true);
}

//更换图像
function ChangeWallpaper(element, src) {
    EndDragWallpaper(element);
    var newWallpaper = new Image();
    newWallpaper.src = src;
    newWallpaper.onload = function () {
        element.dataset.originWidth = newWallpaper.width;
        element.dataset.originHeight = newWallpaper.height;
        element.src = src;
        ResetWallpaper(element);
        newWallpaper = null;
    };
}

function imageResponse(propertyName, filePath) {
    ChangeWallpaper(document.getElementById("wallpaper" + propertyName.replace(/[^\d]/g, "")), "file:///" + filePath);
}

function RandomChangeWallpaper(wallpaperId) {
    var tempNum = parseInt(wallpaperId.replace(/[^\d]/g, ""));
    if (isInWallpaperEngine && hasWallpaperFromWE[tempNum] && useWallpaperFromWE[tempNum]) {
        //WE的随机获取文件完全是固定顺序的
        var tempNum1 = Math.floor(Math.random() * 15);
        for (var i = 0; i < tempNum1; i++) {
            window.wallpaperRequestRandomFileForProperty("wallpapersDirectory" + tempNum, function () {
            });
        }
        window.wallpaperRequestRandomFileForProperty("wallpapersDirectory" + tempNum, imageResponse);
    } else {
        if (arrayForRandomWallpaper[tempNum].length > 0) {
            var randomFolder = arrayForRandomWallpaper[tempNum][Math.floor(Math.random() * arrayForRandomWallpaper[tempNum].length)];
            ChangeWallpaper(document.getElementById(wallpaperId), "wallpapers/" + wallpapersConfig[wallpaperId].folder[randomFolder] + "/" + Math.floor(Math.random() * wallpaperFolders[wallpapersConfig[wallpaperId].folder[randomFolder]].count + 1) + ".jpg");
        }
    }
}

function RandomChangeWallpapers() {
    changedTimes++;
    for (var wallpaperIndex = 0; wallpaperIndex < wallpapersCount; wallpaperIndex++) {
        if (generalConfig.changeOneByOne) {
            if (changedTimes % wallpapersCount == wallpaperIndex) {
                RandomChangeWallpaper("wallpaper" + wallpaperIndex);
            }
        } else {
            RandomChangeWallpaper("wallpaper" + wallpaperIndex);
        }
    }
    timeoutChangeWallpapers = setTimeout(function () {
        RandomChangeWallpapers();
    }, generalConfig.updateInterval);
}

//自动更换壁纸
function AutoChangeWallpapers() {
    changedTimes = 0;
    timeoutChangeWallpapers = setTimeout(function () {
        RandomChangeWallpapers(changedTimes);
    }, generalConfig.updateInterval);
}

//壁纸操作事件绑定
function BindWallpapersEvents() {
    $(".wallpaper").on({
        mousedown: function () {
            event.preventDefault();
            //长按缩小图像
            (function (self) {
                longPressWallpaperInterval = setTimeout(function () {
                    ResetWallpaper(self);
                }, 800);
                DoubleTrigger(function () {
                    ZoomWallpaper(self, parseFloat(self.dataset.scale) + 0.3, event.offsetX, event.offsetY);
                }, 200);
            })(this);
            StartDragWallpaper(this);
        },
        mouseup: function () {
            event.preventDefault();
            clearInterval(longPressWallpaperInterval);
            EndDragWallpaper(this);
        },
        mousewheel: function () {
            ZoomWallpaper(this, event.wheelDelta / 1200 + parseFloat(this.dataset.scale, 10), event.offsetX, event.offsetY);
        },
        mouseleave: function () {
            EndDragWallpaper(this);
        }
    });
}

//缩放小部件
function ZoomWidget(element, scale, animate) {
    var newScale = Clamp(scale, 0.001, 4);
    var widgetConfig = widgetsConfig[element.id];
    var correctionFactor = 1;
    var originWidth = stringToPx(widgetConfig.width, element, true);
    var originHeight = stringToPx(widgetConfig.height, element, false);
    correctionFactor = Math.min(originWidth, originHeight) * newScale / 120;
    if (correctionFactor < 1) {
        newScale /= correctionFactor;
    }
    var newWidth = originWidth * newScale;
    correctionFactor = newWidth / screenWidth;
    if (correctionFactor > 1) {
        newScale /= correctionFactor;
        newWidth = originWidth * newScale;
    }
    var newHeight = originHeight * newScale;
    correctionFactor = newHeight / screenHeight;
    if (correctionFactor > 1) {
        newScale /= correctionFactor;
        newHeight = originHeight * newScale;
        newWidth = originWidth * newScale;
    }
    var newLeft = Clamp(parseFloat(widgetConfig.left, 10) - originWidth * (newScale - widgetConfig.scale) / 2, 0, screenWidth - newWidth);
    var newTop = Clamp(parseFloat(widgetConfig.top, 10) - originHeight * (newScale - widgetConfig.scale) / 2, 0, screenHeight - newHeight);
    if (animate) {
        $(element).children(".widgetContent").each(function () {
            this.style.transform = "scale(" + newScale + ")";
        });
        $(element).css({
            width: newWidth,
            height: newHeight,
            left: newLeft,
            top: newTop
        });
    } else {
        $(element).addClass("noTransition");
        $(element).children(".widgetContent").each(function () {
            $(this).addClass("noTransition");
            this.style.transform = "scale(" + newScale + ")";
        });
        $(element).css({
            width: newWidth,
            height: newHeight,
            left: newLeft,
            top: newTop
        });
        $(element).removeClass("noTransition");
        $(element).children(".widgetContent").each(function () {
            $(this).removeClass("noTransition");
        });
    }
    widgetConfig.left = newLeft + "px";
    widgetConfig.top = newTop + "px";
    widgetConfig.scale = newScale;
}

//开始拖拽小部件
function StartDragWidget(element) {
    $(element).addClass("noTransition");
    $Widgets.css("pointer-events", "auto");
    var lastMousePos = {x: event.pageX, y: event.pageY};
    $Widgets.on({
        'mousemove': function (event) {
            event.preventDefault();
            var nowMousePos = {x: event.pageX, y: event.pageY};
            var widgetConfig = widgetsConfig[element.id];
            var newLeft = Clamp(parseFloat(widgetConfig.left) + nowMousePos.x - lastMousePos.x, 0, screenWidth - element.clientWidth);
            var newTop = Clamp(parseFloat(widgetConfig.top) + nowMousePos.y - lastMousePos.y, 0, screenHeight - element.clientHeight);
            $(element).css({
                "left": newLeft,
                "top": newTop
            });
            lastMousePos = nowMousePos;
            widgetConfig.left = newLeft;
            widgetConfig.top = newTop;
        }
    });
    $Widgets.one({
        mouseup: function () {
            event.preventDefault();
            EndDragWidget(element);
        },
        mouseleave: function () {
            event.preventDefault();
            EndDragWidget(element);
        }
    });
}

//结束拖拽小部件
function EndDragWidget(element) {
    $Widgets.off('mousemove');
    $Widgets.css("pointer-events", "none");
    $(element).removeClass("noTransition");
}

//编辑小部件
function EditWidget(element) {
    if (element.dataset.isEditing == "false") {
        $(element).children(".widgetEditor").show();
        element.style.backgroundColor = "rgba(0,0,0,0.4)";
        element.dataset.isEditing = "true";
        $LayerBetweenWallpapersAndWidgets.css("pointerEvents", "auto");
        $LayerBetweenWallpapersAndWidgets.on("mousedown", function () {
            EditWidget(element);
        });
    } else if (element.dataset.isEditing == "true") {
        $LayerBetweenWallpapersAndWidgets.css("pointerEvents", "none");
        $LayerBetweenWallpapersAndWidgets.off("mousedown");
        $(element).children(".widgetEditor").hide();
        element.style.backgroundColor = "transparent";
        element.dataset.isEditing = "false";
    }
}

//隐藏小部件
function HideWidget(element) {
    widgetsConfig[element.id].show = false;
    element.style.display = "none";
}

//隐藏所有小部件
function HideAllWidgets() {
    for (widgetId in widgetsConfig) {
        HideWidget(document.getElementById(widgetId));
    }
}

//显示小部件
function ShowWidget(element) {
    widgetsConfig[element.id].show = true;
    element.style.display = "block";
}

//显示所有小部件
function ShowAllWidgets() {
    for (widgetId in widgetsConfig) {
        ShowWidget(document.getElementById(widgetId));
    }
}

//小部件操作事件绑定
function BindWidgetsEvents() {
    $(".widget").on({
        mousedown: function () {
            event.preventDefault();
            if (!/widgetEditor/.test(event.target.className)) {
                (function (self) {
                    DoubleTrigger(function () {
                        EditWidget(self);
                    }, 200);
                })(this);
                StartDragWidget(this);
            }
        }
    });
    $(".widgetClose").on({
        click: function () {
            HideWidget(this.parentNode);
        }
    });
    $(".widgetEnlarge").on({
        click: function () {
            ZoomWidget(this.parentNode, widgetsConfig[this.parentNode.id].scale + 0.3, true);
        }
    });
    $(".widgetNarrow").on({
        click: function () {
            ZoomWidget(this.parentNode, widgetsConfig[this.parentNode.id].scale - 0.3, true);
        }
    });
}

//开始拖拽设置窗口
function StartDragSettingsDialog() {
    $SettingsDialog.addClass("noTransition");
    $Settings.css("pointer-events", "auto");
    var lastMousePos = {x: event.pageX, y: event.pageY};
    $Settings.on({
        mousemove: function (event) {
            event.preventDefault();
            var nowMousePos = {x: event.pageX, y: event.pageY};
            var newLeft = Clamp(parseFloat(generalConfig.settingsDialogLeft) + nowMousePos.x - lastMousePos.x, 0, screenWidth - 360);
            var newTop = Clamp(parseFloat(generalConfig.settingsDialogTop) + nowMousePos.y - lastMousePos.y, 0, screenHeight - 720);
            $SettingsDialog.css({
                "left": newLeft,
                "top": newTop
            });
            lastMousePos = nowMousePos;
            generalConfig.settingsDialogLeft = newLeft + "px";
            generalConfig.settingsDialogTop = newTop + "px";
        }
    });
    $Settings.one({
        mouseleave: function () {
            event.preventDefault();
            EndDragSettingsDialog();
        },
        mouseup: function () {
            event.preventDefault();
            EndDragSettingsDialog();
        }
    });
}

//结束拖拽设置窗口
function EndDragSettingsDialog() {
    $Settings.off('mousemove');
    $Settings.css("pointer-events", "none");
    $SettingsDialog.removeClass("noTransition");
}

//设置窗口事件绑定
function BindSettingsDialogEvents() {
    $("#edgeForOpenSettingsDialogButton").on("mouseenter", function () {
        $('#buttonsFolder').css('top', '0px');
    });
    $("#buttonsFolder").on({
        mouseleave: function () {
            this.style.top = "-150px";
        }
    });
    $("#openSettingsDialogButton").on({
        click: function () {
            $('#settingsDialog').show();
            $("#edgeForOpenSettingsDialogButton").hide();
            $("#settingsDialog").css("opacity","1");
        }
    });
    $("#nextWallpapersButton").on({
        click: function () {
            clearTimeout(timeoutChangeWallpapers);
            timeoutChangeWallpapers = setTimeout(function () {
                RandomChangeWallpapers();
            }, 0);
        }
    });
    //拖拽顶栏来拖动设置窗口
    $("#topBarInSettingsDialog").on({
        mousedown: function () {
            event.preventDefault();
            StartDragSettingsDialog();
        }
    });
    //配置导出功能
    var copy = new Clipboard('#exportButtonInSettingsDialog', {
        text: function (trigger) {
            Log("配置文件将复制到剪贴板，在网页浏览器地址栏粘贴进行导出<br/>最后将导出的配置文件复制粘贴到本“壁纸”根目录，可能需要重命名为\"user-config.js\"");
            return generateDataHtmlURL("var config=" + JSON.stringify(ExportConfig()),null,4);
        }
    });
    //关闭设置窗口
    $("#closeButtonInSettingsDialog").on("mousedown", function () {
        $("#settingsDialog").css("opacity","0");
        setTimeout(function () {
            $("#edgeForOpenSettingsDialogButton").show();
            $('#settingsDialog').hide();
        },420);
    });
    $("select").on({
        mousedown: function () {
            if (this.size == 0) this.size = this.length;
            $(this).addClass("selecting");
        },
        change: function () {
            this.size = 0;
            $(this).removeClass("selecting");
            $(this).addClass("selected");
        },
        blur: function () {
            this.size = 0;
            $(this).removeClass("selecting");
            $(this).removeClass("selected");
        }
    });
    //更新间隔设置
    $("#updateInterval").on({
        change: function () {
            generalConfig.updateInterval = this.options[this.selectedIndex].value;
            clearTimeout(timeoutChangeWallpapers);
            timeoutChangeWallpapers = setTimeout(function () {
                RandomChangeWallpapers();
            }, generalConfig.updateInterval);
        }
    });
    //逐一更换设置
    $("#changeOneByOne").on({
        change: function () {
            generalConfig.changeOneByOne = this.checked;
        }
    });
    //背景颜色设置
    $("#backgroundColor").on({
        change: function () {
            if (/#[\d|a-f|A-F]{6}/.test(this.value)) {
                generalConfig.backgroundColor = this.value;
                $("body").css("background-color", this.value);
            }
        }
    });
    //显示小部件设置
    $("#showWidgets").on({
        change: function () {
            generalConfig.showWidgets = this.checked;
            if (this.checked) {
                ShowAllWidgets();
            } else {
                HideAllWidgets();
            }
        }
    });
    //显示器数量设置
    $("#monitorCount_text").on({
        change: function () {
            var tempNum = Clamp(parseInt(this.value.replace(/[^\d]/g, "")), 1, 6);
            tempNum = isNaN(tempNum) ? 1 : tempNum;
            this.value = tempNum;
            document.getElementById("monitorCount_range").value = tempNum;
        }
    });
    $("#monitorCount_range").on({
        change: function () {
            document.getElementById("monitorCount_text").value = this.value;
        }
    });
    //选择要设置的显示器
    $("#monitorToSet_select").on({
        change: function () {
            if (document.getElementById("wallpaper" + this.selectedIndex) != null) {
                document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[this.selectedIndex];
                document.getElementById("wallpaperFolderCheckWE随机图片文件夹").checked = useWallpaperFromWE[this.selectedIndex];
                for (folderName in wallpaperFolders) {
                    document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[this.selectedIndex] && useWallpaperFromWE[this.selectedIndex];
                    document.getElementById("wallpaperFolderCheck" + folderName).checked = wallpaperFolders[folderName].contain[this.selectedIndex];
                }
                document.getElementById("inputWidth").value = stringToPx(wallpapersConfig["wallpaper" + this.selectedIndex].width, document.getElementById("wallpaper" + this.selectedIndex).parentNode, true);
                document.getElementById("inputHeight").value = stringToPx(wallpapersConfig["wallpaper" + this.selectedIndex].height, document.getElementById("wallpaper" + this.selectedIndex).parentNode, false);
                document.getElementById("inputLeft").value = stringToPx(wallpapersConfig["wallpaper" + this.selectedIndex].left, document.getElementById("wallpaper" + this.selectedIndex).parentNode, true);
                document.getElementById("inputTop").value = stringToPx(wallpapersConfig["wallpaper" + this.selectedIndex].top, document.getElementById("wallpaper" + this.selectedIndex).parentNode, false);
            } else {
                document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = true;
                document.getElementById("wallpaperFolderCheckWE随机图片文件夹").checked = false;
                for (folderName in wallpaperFolders) {
                    document.getElementById("wallpaperFolderCheck" + folderName).checked = false;
                    document.getElementById("wallpaperFolderCount" + folderName).value = "NaN";
                }
                document.getElementById("inputWidth").value = "NaN";
                document.getElementById("inputHeight").value = "NaN";
                document.getElementById("inputLeft").value = "NaN";
                document.getElementById("inputTop").value = "NaN";
            }
        }
    });
    //壁纸设置
    $(".wallpaperFolder .filled-in").on({
        change: function () {
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                var folderName = this.id.replace("wallpaperFolderCheck", "");
                if (folderName === "WE随机图片文件夹") {
                    useWallpaperFromWE[index] = this.checked;
                    wallpapersConfig["wallpaper" + index].useWallpaperFromWE = this.checked;
                    for (folderName in wallpaperFolders) {
                        document.getElementById("wallpaperFolderCheck" + folderName).disabled = this.checked;
                    }
                } else {
                    wallpaperFolders[folderName].contain[index] = this.checked;
                    var wallpaperConfig = wallpapersConfig["wallpaper" + index];
                    if (this.checked) {
                        wallpaperConfig.folder.push(folderName);
                    } else {
                        wallpaperConfig.folder.remove(folderName);
                    }
                    var tempArray = [];
                    for (var i = 0; i < wallpaperConfig.folder.length; i++) {
                        for (var j = 0; j < wallpaperFolders[folderName].count; j++) {
                            tempArray.push(i);
                        }
                    }
                    arrayForRandomWallpaper[index] = tempArray;
                }
            }
        }
    });
    $("#expandWallpaperFolders").on({
        click: function () {
            var contentBox = document.getElementById("contentBox");
            if (this.innerHTML === "╋") {
                this.parentNode.style.height = (document.getElementById("wallpaperFolders").offsetHeight + 30) + "px";
                this.innerHTML = "━";
            } else {
                this.parentNode.style.height = "23px";
                this.innerHTML = "╋";
            }
            document.getElementById("contentBox").style["padding-right"] = (20 + contentBox.clientWidth - contentBox.offsetWidth) + "px";
        }
    });
    $(".wallpaperFolder .inputFolderCount").on({
        change: function () {
            if (/[^\d]/.test(this.value)) {
                this.value = this.value.replace(/[^\d]/g, "");
            }
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                var num = parseInt(this.value);
                var folderName = this.id.replace("wallpaperFolderCount", "");
                if (num >= 0 && wallpaperFolders[folderName].count !== num) {
                    wallpaperFolders[folderName].count = num;
                    for (wallpaperId in wallpapersConfig) {
                        var wallpaperConfig = wallpapersConfig[wallpaperId];
                        if (wallpaperConfig.index < generalConfig.monitorCount) {
                            var tempArray = [];
                            for (var i = 0; i < wallpaperConfig.folder.length; i++) {
                                for (var j = 0; j < wallpaperFolders[wallpaperConfig.folder[i]].count; j++) {
                                    tempArray.push(i);
                                }
                            }
                            arrayForRandomWallpaper[wallpaperConfig.index] = tempArray;
                        }
                    }
                }
            }
        }
    });
    $("#inputWidth").on({
        change: function () {
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                wallpapersConfig["wallpaper" + index].width = this.value + "px";
                document.getElementById("wallpaper" + index).parentNode.style.width = this.value + "px";
            }
        }
    });
    $("#inputHeight").on({
        change: function () {
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                wallpapersConfig["wallpaper" + index].height = this.value + "px";
                document.getElementById("wallpaper" + index).parentNode.style.height = this.value + "px";
            }
        }
    });
    $("#inputLeft").on({
        change: function () {
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                wallpapersConfig["wallpaper" + index].left = this.value + "px";
                document.getElementById("wallpaper" + index).parentNode.style.left = this.value + "px";
            }
        }
    });
    $("#inputTop").on({
        change: function () {
            var index = document.getElementById("monitorToSet_select").selectedIndex;
            if (document.getElementById("wallpaper" + index) != null) {
                wallpapersConfig["wallpaper" + index].top = this.value + "px";
                document.getElementById("wallpaper" + index).parentNode.style.top = this.value + "px";
            }
        }
    });
}
