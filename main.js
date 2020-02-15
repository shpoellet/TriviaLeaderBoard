const {app, BrowserWindow, Menu} = require('electron')


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win

  function createWindows () {
    var controlWinReady = false;
    var displayWinReady = false;


    function startMain(){
      if (controlWinReady & displayWinReady) runMain();
    }

    // Create the control window.
    controlWin = new BrowserWindow({
      width: 1100,
      minWidth: 600,
      height: 850,
      minHeight: 500,
      x: 450,
      y: 0,
      // center: false,
      useContentSize: true,
      // resizable: false,
      // fullscreen: true,
      show:false});

    displayWin = new BrowserWindow({
      width: 400,
      height: 1000,
      x: 0,
      y: 0,
      useContentSize: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      show:false})



    // and load the index.html of the app.
    controlWin.loadFile('app/index.html')
    displayWin.loadFile('app/display.html')

    // Emitted when the window is closed.
    controlWin.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      controlWin = null
      displayWin.close();
      displayWin = null
    })

    controlWin.once('ready-to-show', function (){
      controlWinReady = true;
  	  controlWin.show();
  	  startMain();
    })

    displayWin.once('ready-to-show', function (){
      displayWinReady = true;
      displayWin.show();
  	  startMain();
    })

    //Menu.setApplicationMenu(null);
  }


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindows)

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (process.platform !== 'darwin') {
    //   app.quit()
    // }
    app.quit()
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindows()
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
  function runMain(){
  	console.log("start");
  	var LeaderBoad = require('./app/js/leader-board.js');
  	LeaderBoad.init(displayWin, controlWin);
  }
