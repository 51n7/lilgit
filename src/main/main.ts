import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import os from 'os';
import { simpleGit } from 'simple-git';
import * as diff from 'diff';
import Store from 'electron-store'; // https://github.com/sindresorhus/electron-store
import chokidar from 'chokidar'; // https://github.com/paulmillr/chokidar
import {
  RepoPathProp,
  ExtendMergeDetail,
  ExtendedStatusResult,
} from 'src/types';

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

async function getStatus(path: string): Promise<ExtendedStatusResult> {
  const git = simpleGit(gitOptions(path));
  const status = await git.status();

  return {
    not_added: status.not_added,
    conflicted: status.conflicted,
    created: status.created,
    deleted: status.deleted,
    ignored: status.ignored,
    modified: status.modified,
    renamed: status.renamed,
    files: status.files,
    staged: status.staged,
    ahead: status.ahead,
    behind: status.behind,
    current: status.current,
    tracking: status.tracking,
    detached: status.detached,
    diff: {
      tracked: diff.parsePatch(await git.diff(['HEAD'])),
      untracked: await getUntrackedDiff(path),
    },
  };
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

async function getUntrackedDiff(path: string): Promise<diff.ParsedDiff[]> {
  const git = simpleGit(gitOptions(path));
  let completeDiffResponse = '';

  /*
  converted the following command into JS
  git ls-files --others --exclude-standard -z | xargs -0 -n 1 git --no-pager diff /dev/null
  */

  try {
    // get untracked files
    const lsFilesOutput = await git.raw([
      'ls-files',
      '--others',
      '--exclude-standard',
      '-z',
    ]);
    const untrackedFiles = lsFilesOutput.split('\0').filter(Boolean);

    // return diff for each untracked file
    const diffOutputs = await Promise.all(
      untrackedFiles.map((file) => git.raw(['diff', '/dev/null', file])),
    );

    // convert git diff response to json
    completeDiffResponse = diffOutputs.join('\n');
    return diff.parsePatch(completeDiffResponse);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Wait for Electron app to be ready before registering IPC listeners.
app.whenReady().then(() => {
  const store = new Store();
  store.set('current-repo', '');

  let currentWatcher: chokidar.FSWatcher | null = null;
  let debounceTimeout: NodeJS.Timeout | null = null;

  function debounce(callback: () => void, delay: number) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      callback();
      debounceTimeout = null;
    }, delay);
  }

  if (!store.get('repos')) {
    store.set('repos', []);
  }

  const pathsArray: RepoPathProp[] = store.get('repos') as [];

  ipcMain.on('get-current', (event) => {
    event.sender.send('get-current-success', store.get('current-repo'));
  });

  ipcMain.on('set-current', (event, path) => {
    const sender = event.sender;
    const absolute = path.absolute;
    const git = simpleGit(gitOptions(absolute));
    store.set('current-repo', path);

    if (currentWatcher) {
      currentWatcher.close();
      currentWatcher = null;
    }

    currentWatcher = chokidar.watch(absolute, {
      persistent: true,
      ignoreInitial: true,
    });

    currentWatcher.on('all', () => {
      // currentWatcher props (event, watchedPath)
      debounce(async () => {
        sender.send(
          'directory-changed',
          JSON.parse(JSON.stringify(await getStatus(absolute))),
          JSON.parse(JSON.stringify(await git.branch())),
        );
      }, 500);
    });
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

  ipcMain.on('open-file', async (_event, path) => {
    shell.openPath(path);
  });

  ipcMain.on('stage-file', async (event, path, name) => {
    const git = simpleGit(gitOptions(path));
    try {
      await git.add(name);
      event.sender.send(
        'stage-file-success',
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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
        JSON.parse(JSON.stringify(await getStatus(path))),
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

  ipcMain.on('push-branch', async (event, path, branch, remote) => {
    const git = simpleGit(gitOptions(path));

    event.sender.send('process-started', 'Pushing');

    try {
      if (remote) {
        event.sender.send(
          'push-branch-success',
          // await git.push(['--set-upstream', remote, branch]),
          await git.push(remote, branch),
        );
      } else {
        event.sender.send('push-branch-error', 'No remotes found.');
      }
    } catch (err) {
      event.sender.send('push-branch-error', (err as Error).message);
    }
  });

  ipcMain.on('fetch', async (event, path) => {
    const git = simpleGit(gitOptions(path));

    event.sender.send('process-started', 'Fetching');

    try {
      event.sender.send('fetch-branch-success', await git.fetch());
    } catch (err) {
      event.sender.send('fetch-branch-error', (err as Error).message);
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

  ipcMain.on('get-status', async (event, path) => {
    if (path) {
      const status = await getStatus(path);

      try {
        event.sender.send('get-status-success', status);
      } catch (err) {
        event.sender.send('get-status-error', (err as Error).message);
      }
    }
  });
});
