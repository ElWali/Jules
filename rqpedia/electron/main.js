const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({ width: 1200, height: 800, webPreferences: { contextIsolation: true } });
  if(process.env.ELECTRON_SERVE){
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'web', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', ()=>{
  if(process.platform !== 'darwin') app.quit();
});