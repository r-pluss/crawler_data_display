'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

const debugMode = false;
const batarangPath = '/User Data/Default/Extensions/ighdmehidhipcmcojjgiloacoafjmpfk/0.10.7_0'
if(debugMode){
    BrowserWindow.addDevToolsExtension(batarangPath);
}

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: electron.screen.getPrimaryDisplay().size.width,
        height: electron.screen.getPrimaryDisplay().size.height,
        webPreferences: { nodeIntegration: true}
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
});
