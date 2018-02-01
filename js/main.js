//全局变量
var logs = $("#logs");
var arrayForRandomWallpaper = [];

//输出日志
function Log(str) {
    logs.show();
    if (logs.children().length > 19) logs.empty();
    logs.append("<div class='log'>" + str + "</div>");
}


//初始化
window.onload = function () {
    setTimeout(function () {
        //屏蔽右键菜单
        document.oncontextmenu = function () {
            return false;
        };

        $("body").css("background-color", generalConfig.backgroundColor);

        //根据壁纸设置创建壁纸元素
        for (var i = 0; i < generalConfig.monitorCount; i++) {
            if (typeof wallpapersConfig["wallpaper" + i] === "undefined") {
                wallpapersConfig["wallpaper" + i] = {
                    "index": i,
                    "id": "wallpaper" + i,
                    "folder": [],
                    "count": [],
                    "left": "0px",
                    "top": "0px",
                    "width": "0px",
                    "height": "0px"
                }
            }
            if (i !== 0) {
                $("#monitorToSet_select").append("<option value=\"" + i + "\">" + (i + 1) + "</option>")
            }
        }
        for (wallpaperId in wallpapersConfig) {
            var wallpaperConfig = wallpapersConfig[wallpaperId];
            if (wallpaperConfig.index < generalConfig.monitorCount) {
                var tempArray = [];
                for (var i = 0; i < wallpaperConfig.folder.length; i++) {
                    for (var j = 0; j < wallpaperFolders[wallpaperConfig.folder[i]].count; j++) {
                        tempArray.push(i);
                    }
                }
                arrayForRandomWallpaper[wallpaperConfig.index]=tempArray;
                $("#wallpapersContainer").append(
                    "<div class=\"wallpaperContainer\" style=\"left:" + wallpaperConfig.left + ";top:" + wallpaperConfig.top + ";width:" + wallpaperConfig.width + ";height:" + wallpaperConfig.height + ";\"> " +
                    "<img id=\"" + wallpaperId + "\" class=\"wallpaper\"/>" +
                    "</div>"
                );
                RandomChangeWallpaper(wallpaperId);
                wallpapersCount++;
            }
        }

        //根据部件设置加载小部件
        for (widgetId in widgetsConfig) {
            var widgetConfig = widgetsConfig[widgetId];
            $("#widgets").append("<div id=\"" + widgetId + "\" class=\"widget\" style=\"left:" + widgetConfig.left + ";top:" + widgetConfig.top + ";width:" + parseInt(widgetConfig.width, 10) * widgetConfig.scale + "px;height:" + parseInt(widgetConfig.height, 10) * widgetConfig.scale + "px;z-index:" + widgetConfig.zIndex + ";\">" +
                widgetConfig.node +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"widgets/" + widgetId + ".css\">" +
                "<script src=\"widgets/" + widgetId + ".js\"></script>" +
                "<div class=\"widgetClose widgetEditor\"></div>" +
                "<div class=\"widgetNarrow widgetEditor\"></div>" +
                "<div class=\"widgetEnlarge widgetEditor\"></div>" +
                "</div>");
            var element = document.getElementById(widgetId);
            element.dataset.isEditing = "false";
            $(element).children(":not(.widgetEditor)").each(function () {
                $(this).addClass("widgetContent");
            });
            ZoomWidget(element, widgetConfig.scale, false);
            if (!widgetConfig.show) {
                hideWidget(document.getElementById(widgetId));
            }
        }

        //根据一般设置调整设置窗口位置和内容选项
        var tempNum = -1;
        switch (generalConfig.updateInterval) {
            case 5000:
                tempNum = 0;
                break;
            case 60000:
                tempNum = 1;
                break;
            case 300000:
                tempNum = 2;
                break;
            case 600000:
                tempNum = 3;
                break;
            case 1800000:
                tempNum = 4;
                break;
            case 3600000:
                tempNum = 5;
                break;
            case 7200000:
                tempNum = 6;
                break;
            case 14400000:
                tempNum = 7;
                break;
            case 21600000:
                tempNum = 8;
                break;
            case 43200000:
                tempNum = 9;
                break;
            case 86400000:
                tempNum = 10;
                break;
        }
        document.getElementById("updateInterval").selectedIndex = tempNum;
        document.getElementById("changeOneByOne").checked = generalConfig.changeOneByOne;
        document.getElementById("backgroundColor").value = RGB2Hex($("body").css("background-color"));
        if(typeof horizonMap[generalConfig.horizon] !== "undefined"){
            document.getElementById("horizon").selectedIndex = horizonMap[generalConfig.horizon];
        }else{
            generalConfig.horizon = "center";
            document.getElementById("horizon").selectedIndex = 1;
        }
        if(typeof verticalMap[generalConfig.vertical] !== "undefined"){
            document.getElementById("vertical").selectedIndex = verticalMap[generalConfig.vertical];
        }else{
            generalConfig.vertical = "center";
            document.getElementById("vertical").selectedIndex = 1;
        }
        document.getElementById("showWidgets").checked = generalConfig.showWidgets;
        document.getElementById("monitorCount_text").value = generalConfig.monitorCount;
        document.getElementById("monitorCount_range").value = generalConfig.monitorCount;
        document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[0];
        document.getElementById("wallpaperFolderCheckWE随机图片文件夹").checked = hasWallpaperFromWE[0] &&useWallpaperFromWE[0];
        for(folderName in wallpaperFolders){
            $("#wallpaperFolders").append("<div class=\"wallpaperFolder\">\n" +
                " <input type=\"checkbox\" class=\"filled-in\" id=\"wallpaperFolderCheck"+folderName+"\""+ (wallpaperFolders[folderName].contain[0]?"checked":"") + "/>\n" +
                " <label for=\"wallpaperFolderCheck"+folderName+"\" class=\"wallpaperFolderName\">" + folderName + "</label>\n" +
                " <input type=\"text\" class=\"inputFolderCount\" id=\"wallpaperFolderCount" + folderName + "\" value=\"" + wallpaperFolders[folderName].count + "\">" +
                " </div>");
        }
        if(isInWallpaperEngine){
            $("#wallpaperFolders").append("<div class=\"wallpaperFolder\">\n" +
                " <label style=\"color:grey;\">(选择“WE随机文件夹”时将不能选择其他文件夹)</label>\n" +
                " </div>");
        }else{
            $("#wallpaperFolderCheckWE随机图片文件夹").parent().remove();
        }
        document.getElementById("inputWidth").value = stringToPx(wallpapersConfig.wallpaper0.width, document.getElementById("wallpaper0").parentNode, true);
        document.getElementById("inputHeight").value = stringToPx(wallpapersConfig.wallpaper0.height, document.getElementById("wallpaper0").parentNode, false);
        document.getElementById("inputLeft").value = stringToPx(wallpapersConfig.wallpaper0.left, document.getElementById("wallpaper0").parentNode, true);
        document.getElementById("inputTop").value = stringToPx(wallpapersConfig.wallpaper0.top, document.getElementById("wallpaper0").parentNode, false);
        $("#settingsDialog").css({
            "left": generalConfig.settingsDialogLeft,
            "top": generalConfig.settingsDialogTop
        });

        BindWallpapersEvents();
        AutoChangeWallpapers();

        BindWidgetsEvents();

        BindSettingsDialogEvents();

        initiated = true;
    }, 500)
};