var initiated = false;
var isInWallpaperEngine = false;
var hasWallpaperFromWE = [false, false, false, false, false, false];
//var logss = $("#logs");
/*
function Logs(str) {
    logss.show();
    if (logss.children().length > 19) logss.empty();
    logss.append("<div class='log'>" + str + "</div>");
}
*/
window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        isInWallpaperEngine = true;
        /*if(properties.configFile){
            if(typeof properties.configFile.value !== "undefined" && properties.configFile.value.length > 0){
                Logs(properties.configFile.value);
                document.write("<script src=\"file:///"+properties.configFile.value+"?" + Math.random() + "\"><" + "/script>");
                LoadConfig(config);
            }
        }*/
        if (properties.updateInterval) {
            switch (properties.updateInterval.value) {
                case 0:
                    generalConfig.updateInterval = 5000;
                    break;
                case 1:
                    generalConfig.updateInterval = 60000;
                    break;
                case 2:
                    generalConfig.updateInterval = 300000;
                    break;
                case 3:
                    generalConfig.updateInterval = 600000;
                    break;
                case 4:
                    generalConfig.updateInterval = 1800000;
                    break;
                case 5:
                    generalConfig.updateInterval = 3600000;
                    break;
                case 6:
                    generalConfig.updateInterval = 7200000;
                    break;
                case 7:
                    generalConfig.updateInterval = 14400000;
                    break;
                case 8:
                    generalConfig.updateInterval = 21600000;
                    break;
                case 9:
                    generalConfig.updateInterval = 43200000;
                    break;
                case 10:
                    generalConfig.updateInterval = 86400000;
                    break;
            }
            document.getElementById("updateInterval").selectedIndex = properties.updateInterval.value;
            if (initiated) {
                clearTimeout(timeoutChangeWallpapers);
                timeoutChangeWallpapers = setTimeout(function () {
                    RandomChangeWallpapers();
                }, generalConfig.updateInterval);
            }
        }
        if (properties.changeOneByOne) {
            generalConfig.changeOneByOne = properties.changeOneByOne.value;
            document.getElementById("changeOneByOne").checked = properties.changeOneByOne.value;
        }
        if (properties.backgroundColor) {
            var rgb = properties.backgroundColor.value.split(' ');
            var color = "#" + ((1 << 24) + (parseInt(Math.ceil(rgb[0] * 255)) << 16) + (parseInt(Math.ceil(rgb[1] * 255) << 8)) + parseInt(Math.ceil(rgb[2] * 255))).toString(16).slice(1);
            generalConfig.backgroundColor = color;
            document.getElementById("backgroundColor").value = color;
            if (initiated) $("body").css("background-color", color);
        }
        if(properties.vertical){
            generalConfig.vertical = properties.vertical.value;
        }
        if(properties.horizon){
            generalConfig.horizon = properties.horizon.value;
        }
        if (properties.showWidgets) {
            generalConfig.showWidgets = properties.showWidgets.value;
            document.getElementById("showWidgets").checked = properties.showWidgets.value;
            if (initiated) {
                if (properties.showWidgets.value) {
                    ShowAllWidgets();
                } else {
                    HideAllWidgets();
                }
            }
        }
        if (properties.monitorCount) {
            generalConfig.monitorCount = properties.monitorCount.value;
            document.getElementById("monitorCount_text").value = properties.monitorCount.value;
            document.getElementById("monitorCount_range").value = properties.monitorCount.value;
        }
        if (properties.wallpapersDirectory0) {
            hasWallpaperFromWE[0] = typeof properties.wallpapersDirectory0.value !== "undefined" && properties.wallpapersDirectory0.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[0];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[0] && useWallpaperFromWE[0];
            }
        }
        if (properties.wallpapersDirectory1) {
            hasWallpaperFromWE[1]  = typeof properties.wallpapersDirectory1.value !== "undefined" && properties.wallpapersDirectory1.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[1];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[1] && useWallpaperFromWE[1];
            }
        }
        if (properties.wallpapersDirectory2) {
            hasWallpaperFromWE[2]  = typeof properties.wallpapersDirectory2.value !== "undefined" && properties.wallpapersDirectory2.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[2];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[2] && useWallpaperFromWE[2];
            }
        }
        if (properties.wallpapersDirectory3) {
            hasWallpaperFromWE[3]  = typeof properties.wallpapersDirectory3.value !== "undefined" && properties.wallpapersDirectory3.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[3];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[3] && useWallpaperFromWE[3];
            }
        }
        if (properties.wallpapersDirectory4) {
            hasWallpaperFromWE[4]  = typeof properties.wallpapersDirectory4.value !== "undefined" && properties.wallpapersDirectory4.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[4];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[4] && useWallpaperFromWE[4];
            }
        }
        if (properties.wallpapersDirectory5) {
            hasWallpaperFromWE[5]  = typeof properties.wallpapersDirectory5.value !== "undefined" && properties.wallpapersDirectory5.value.length > 0;
            document.getElementById("wallpaperFolderCheckWE随机图片文件夹").disabled = !hasWallpaperFromWE[5];
            for (folderName in wallpaperFolders) {
                document.getElementById("wallpaperFolderCheck" + folderName).disabled = hasWallpaperFromWE[5] && useWallpaperFromWE[5];
            }
        }
    }
};