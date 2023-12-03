import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import os from 'os';
import { simpleGit } from 'simple-git';
import Store from 'electron-store'; // https://github.com/sindresorhus/electron-store
import { RepoPathProp, ExtendMergeDetail } from 'src/types';

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

function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 600,
    backgroundColor: '#22272e',
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

  mainWindow.loadFile('index.html');

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

function convertToTildePath(inputPath: string) {
  const homeDirectory = os.homedir();
  const normalizedPath = path.normalize(inputPath);

  if (normalizedPath.startsWith(homeDirectory)) {
    return `~${normalizedPath.slice(homeDirectory.length)}`;
  }

  return inputPath;
}

function gitOptions(path: string) {
  return {
    baseDir: path,
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
  };
}

async function getBranches(path: string) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    return await git.branch();
  }
}

async function checkoutBranch(path: string, branch: string) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    await git.checkout(branch);
    return await git.branch();
  }
}

async function checkoutRemoteBranch(
  path: string,
  selected: string,
  name: string,
) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    await git.checkoutBranch(name, selected);
    return await git.branch();
  }
}

async function addBranch(path: string, name: string) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    await git.checkoutLocalBranch(name);
    return await git.branch();
  }
}

async function deleteBranch(path: string, name: string) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    await git.deleteLocalBranch(name);
    return await git.branch();
  }
}

// async function stageFile(path: string, name: string) {
//   if (path) {
//     const git = simpleGit(gitOptions(path));
//     await git.add(name);
//     return await git.status();
//   }
// }

async function getStatus(path: string) {
  if (path) {
    const git = simpleGit(gitOptions(path));
    return await git.status();
  }
}

async function selectFolder(
  defaultPath?: string,
): Promise<RepoPathProp | null> {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      defaultPath,
      properties: ['openDirectory'],
    });

    return result.canceled
      ? null
      : {
          absolute: result.filePaths[0],
          short: convertToTildePath(result.filePaths[0]),
        };
  }
  return null;
}

// Wait for Electron app to be ready before registering IPC listeners.
app.whenReady().then(() => {
  const store = new Store();

  if (!store.get('repos')) {
    store.set('repos', []);
  }

  const pathsArray: RepoPathProp[] = store.get('repos') as [];

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
    pathsArray.push(path);
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

  ipcMain.on('get-log', async (event, path) => {
    const git = simpleGit(gitOptions(path));
    const customFormat = '<λ> %h <λ> %s <λ> %an <λ> %at'; // https://git-scm.com/docs/git-log

    git.raw(
      ['log', '--graph', '--oneline', `--format=${customFormat}`],
      (err, log) => {
        if (err) {
          event.sender.send('get-log-error', (err as Error).message);
        } else {
          const formattedLog = log.split('\n').map((line) => {
            const [graph, commit, message, name, time] = line.split('<λ>');

            return {
              graph: graph.trim(),
              commit: commit?.trim(),
              message: message?.trim(),
              name: name?.trim(),
              time: time?.trim(),
            };
          });

          event.sender.send(
            'get-log-success',
            JSON.parse(JSON.stringify(formattedLog)),
          );
        }
      },
    );
  });

  ipcMain.on('checkout-branch', async (event, path, branch) => {
    try {
      event.sender.send(
        'checkout-branch-success',
        await checkoutBranch(path, branch),
      );
    } catch (err) {
      console.log(err);
      event.sender.send('checkout-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('add-branch', async (event, path, name) => {
    try {
      event.sender.send('add-branch-success', await addBranch(path, name));
    } catch (err) {
      event.sender.send('add-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('add-remote-branch', async (event, path, selected, name) => {
    try {
      event.sender.send(
        'add-remote-branch-success',
        await checkoutRemoteBranch(path, selected, name),
      );
    } catch (err) {
      event.sender.send('add-remote-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('delete-branch', async (event, path, name) => {
    try {
      event.sender.send(
        'delete-branch-success',
        await deleteBranch(path, name),
      );
    } catch (err) {
      event.sender.send('delete-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('stage-file', async (event, path, name) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.add(name);
      event.sender.send(
        'stage-file-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('stage-file-error', (err as Error).message);
    }
  });

  ipcMain.on('unstage-file', async (event, path, name) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.reset(['--mixed', name]);

      event.sender.send(
        'unstage-file-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('unstage-file-error', (err as Error).message);
    }
  });

  ipcMain.on('discard', async (event, path, name) => {
    const git = simpleGit(gitOptions(path));
    try {
      /*
      unfortunately the git lib doesnt support `git restore file/to/revert.txt`, it was only added to git in 2019.. 🤷
      this workaround uses the git cli equivalent of: git checkout HEAD -- file/to/revert.txt */
      await git.checkout(['HEAD', '--', name]);

      event.sender.send(
        'discard-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('discard-error', (err as Error).message);
    }
  });

  ipcMain.on('discard-all', async (event, path) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.reset(['--hard']); // revert any uncommitted changes
      await git.clean('df'); // remove untracked files AND directories

      event.sender.send(
        'discard-all-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('discard-all-error', (err as Error).message);
    }
  });

  ipcMain.on('stage-all', async (event, path) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.add('-u');

      event.sender.send(
        'stage-all-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('stage-all-error', (err as Error).message);
    }
  });

  ipcMain.on('stage-all-untracked', async (event, path) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.add('-A');

      event.sender.send(
        'stage-all-untracked-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('stage-all-untracked-error', (err as Error).message);
    }
  });

  ipcMain.on('unstage-all', async (event, path) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.reset(['--mixed']);

      event.sender.send(
        'unstage-all-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('unstage-all-error', (err as Error).message);
    }
  });

  ipcMain.on('commit', async (event, path, message) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.commit(message);

      event.sender.send(
        'commit-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('commit-error', (err as Error).message);
    }
  });

  ipcMain.on('commit-unstaged', async (event, path, message) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.commit(message, ['-a']);

      event.sender.send(
        'commit-unstaged-success',
        JSON.parse(JSON.stringify(await git.status())),
      );
    } catch (err) {
      event.sender.send('commit-unstaged-error', (err as Error).message);
    }
  });

  ipcMain.on('pull-branch', async (event, path, branch) => {
    const git = simpleGit(gitOptions(path));

    event.sender.send('process-started', 'Pulling');

    try {
      console.log(`pull: ${branch}`);
      // event.sender.send(
      //   'pull-branch-success',
      //   await git.pull('origin/main', 'main'),
      // );
      event.sender.send('pull-branch-success', await git.pull());
    } catch (err) {
      event.sender.send('pull-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('push-branch', async (event, path, branch) => {
    const git = simpleGit(gitOptions(path));

    event.sender.send('process-started', 'Pushing');

    try {
      console.log(`push: ${branch}`);
      event.sender.send('push-branch-success', await git.push());
    } catch (err) {
      event.sender.send('push-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('merge-branch', async (event, path, selected, current) => {
    const git = simpleGit(gitOptions(path));
    try {
      const mergeSummary = await git.mergeFromTo(selected, current);
      event.sender.send('merge-branch-success', mergeSummary);
    } catch (err) {
      const mergeError = err as ExtendMergeDetail;

      if (mergeError.git !== undefined) {
        event.sender.send(
          'merge-branch-error',
          JSON.stringify({
            git: mergeError.git,
          }),
        );
      } else {
        const errorToSend = {
          name: mergeError.name,
          message: mergeError.message,
          stack: mergeError.stack,
        };
        event.sender.send('merge-branch-error', JSON.stringify(errorToSend));
      }
    }
  });

  ipcMain.on('get-status', (event, path) => {
    getStatus(path).then((path) => {
      const cleanResponse = { ...path };
      delete cleanResponse.isClean;
      event.sender.send('get-status-success', cleanResponse);
    });
  });
});
