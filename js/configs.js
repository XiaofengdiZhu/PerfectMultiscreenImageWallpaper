var wallpapersConfig = null;
var generalConfig = null;
var widgetsConfig = null;
var useWallpaperFromWE = [false, false, false, false, false, false];
var wallpaperFolders = {};

function LoadConfig(jsonConfig) {
    wallpapersConfig = jsonConfig["wallpapersConfig"];
    generalConfig = jsonConfig["generalConfig"];
    widgetsConfig = jsonConfig["widgetsConfig"];
    generalConfig.monitorCount = isNaN(generalConfig.monitorCount) ? 1 : Math.max(Math.min(generalConfig.monitorCount, 6), 1);
    for (var i = 0; i < 6; i++) {
        if (typeof wallpapersConfig["wallpaper" + i] !== "undefined") {
            var wallpaperConfig = wallpapersConfig["wallpaper" + i];
            useWallpaperFromWE[i] = wallpaperConfig.useWallpaperFromWE;
            for (var j = 0; j < wallpaperConfig.folder.length; j++) {
                if (typeof wallpaperFolders[wallpaperConfig.folder[j]] === "undefined") {
                    wallpaperFolders[wallpaperConfig.folder[j]] = {
                        count: wallpaperConfig.count[j],
                        contain: [false, false, false, false, false, false]
                    };
                    wallpaperFolders[wallpaperConfig.folder[j]].contain[i] = true;
                }
                else {
                    if (wallpaperFolders[wallpaperConfig.folder[j]].count > wallpaperConfig.count[j]) {
                        wallpaperFolders[wallpaperConfig.folder[j]].count = wallpaperConfig.count[j];
                    }
                    wallpaperFolders[wallpaperConfig.folder[j]].contain[i] = true;
                }
            }
        }
    }
}

function ExportConfig() {
    for(wallpaperId in wallpapersConfig){
        var wallpaperConfig = wallpapersConfig[wallpaperId];
        var tempArray = [];
        for(var i=0;i<wallpaperConfig.folder.length;i++){
            tempArray.push(wallpaperFolders[wallpaperConfig.folder[i]].count);
        }
        wallpaperConfig.count = tempArray;
    }
    return {"wallpapersConfig": wallpapersConfig, "generalConfig": generalConfig, "widgetsConfig": widgetsConfig};
}

LoadConfig(config);