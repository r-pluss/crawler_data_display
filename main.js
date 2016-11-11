'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: electron.screen.getPrimaryDisplay().size.width,
        height: electron.screen.getPrimaryDisplay().size.height
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
});
