const { app, BrowserWindow } = require("electron");

function createWindow() {
  let winLoad = new BrowserWindow({
    frame: true,
    icon: "qr-code.ico",
    title: "QRCode Created",
    simpleFullscreen: true,
    show: false,
  });
  winLoad.setMenuBarVisibility(false);
  winLoad.on("ready-to-show", () => {
    if (winLoad != null) {
      winLoad.show();
      winLoad.focus();
      winLoad.maximize();
    }
  });
  winLoad.on("close", () => {
    winLoad = null;
  });
  winLoad.loadURL(`file://${__dirname}/view/index.html`);
  return winLoad;
}

app.on("ready", createWindow);
