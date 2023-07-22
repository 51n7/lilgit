import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
// import fs from 'fs';
import { simpleGit } from 'simple-git';
import Store from 'electron-store'; // https://github.com/sindresorhus/electron-store
import { Repo } from 'src/types';

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * Main window instance.
 */
let mainWindow: BrowserWindow | null;
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', createMainWindow);

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  /**
   * On OS X it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q
   */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Create main window
 * @returns {BrowserWindow} Main window instance
 */

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 600,
    backgroundColor: '#202020',
    show: false,
    autoHideMenuBar: true,
    icon: path.resolve('assets/favicon.ico'),
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  // Load the index.html of the app window.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window when its ready to
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  // Close all windows when main window is closed
  mainWindow.on('close', () => {
    mainWindow = null;
    app.quit();
  });

  return mainWindow;
}

/**
 * In this file you can include the rest of your app's specific main process code.
 * You can also put them in separate files and import them here.
 */

async function getBranches(path: string) {
  if (path) {
    const options = {
      baseDir: path,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };
    const git = simpleGit(options);
    return await git.branchLocal();
  }
}

async function selectFolder(defaultPath?: string): Promise<string | null> {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      defaultPath,
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  }
  return null;
}

// Wait for Electron app to be ready before registering IPC listeners.
app.whenReady().then(() => {
  const store = new Store();

  if (!store.get('repos')) {
    store.set('repos', []);
  }

  const pathsArray: Repo[] = store.get('repos') as [];

  ipcMain.on('get-current', (event) => {
    event.sender.send('get-current-success', store.get('current-repo'));
  });

  ipcMain.on('set-current', (_event, path) => {
    store.set('current-repo', path);
  });

  ipcMain.on('remove-current', () => {
    store.delete('current-repo');
  });

  ipcMain.on('get-repos', (event) => {
    event.sender.send('get-repos-success', store.get('repos'));
  });

  ipcMain.on('delete-repo', (_event, index) => {
    pathsArray.splice(index, 1);
    store.set('repos', pathsArray);
  });

  ipcMain.on('save-path', (_event, path) => {
    pathsArray.push({
      label: path,
      value: path,
    });
    store.set('repos', pathsArray);
  });

  ipcMain.on('get-path', (event) => {
    selectFolder().then((path) => {
      event.sender.send('get-path-success', path);
    });
  });

  ipcMain.on('get-branches', (event, path) => {
    getBranches(path).then((path) => {
      event.sender.send('get-branches-success', path);
    });
  });
});
