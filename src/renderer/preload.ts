// src/preload.ts

// `contextBridge` expose an API to the renderer process.
// `ipcRenderer` is used for IPC (inter-process communication) with main process.
// We use it in the preload instead of renderer in order to expose only
// whitelisted wrappers to increase the security of our application.
import { contextBridge, ipcRenderer } from 'electron';
import {
  RepoPathProp,
  GitLogEntry,
  ExtendMergeDetail,
  ExtendedStatusResult,
} from 'src/types';
import { BranchSummary, MergeDetail } from 'simple-git';

// Create a type that should contain all the data we need to expose in the
// renderer process using `contextBridge`.
export type ContextBridgeApi = {
  getRepos: () => Promise<RepoPathProp[]>;
  getCurrent: () => Promise<RepoPathProp>;
  saveCurrent: (path: RepoPathProp) => Promise<RepoPathProp>;
  removeCurrent: () => void;
  deleteRepo: (index: number) => Promise<number>;
  savePath: (path: RepoPathProp) => Promise<RepoPathProp>;
  getPath: () => Promise<RepoPathProp>;
  getBranches: (path: string | undefined) => Promise<BranchSummary>;
  getLog: (path: string | undefined) => Promise<GitLogEntry[]>;
  checkoutBranch: (
    path: string | undefined,
    branch: string,
  ) => Promise<BranchSummary>;
  addBranch: (path: string | undefined, name: string) => Promise<BranchSummary>;
  addRemoteBranch: (
    path: string | undefined,
    selected: string,
    current: string,
  ) => Promise<BranchSummary>;

  deleteBranch: (
    path: string | undefined,
    name: string,
  ) => Promise<BranchSummary>;
  openFile: (path: string) => void;
  stageFile: (
    path: string | undefined,
    name: string,
  ) => Promise<ExtendedStatusResult>;
  unstageFile: (
    path: string | undefined,
    name: string,
  ) => Promise<ExtendedStatusResult>;
  discard: (
    path: string | undefined,
    name: string,
  ) => Promise<ExtendedStatusResult>;
  discardAll: (path: string | undefined) => Promise<ExtendedStatusResult>;
  stageAll: (path: string | undefined) => Promise<ExtendedStatusResult>;
  stageAllUntracked: (
    path: string | undefined,
  ) => Promise<ExtendedStatusResult>;
  unstageAll: (path: string | undefined) => Promise<ExtendedStatusResult>;
  commit: (
    path: string | undefined,
    message: string,
  ) => Promise<ExtendedStatusResult>;
  commitUnstaged: (
    path: string | undefined,
    message: string,
  ) => Promise<ExtendedStatusResult>;
  pullBranch: (path: string | undefined, branch: string) => Promise<string>;
  pushBranch: (
    path: string | undefined,
    branch: string,
    remote: string | undefined,
  ) => Promise<string>;
  fetch: (path: string | undefined) => Promise<string>;
  mergeBranch: (
    path: string | undefined,
    selected: string,
    current: string,
  ) => Promise<string>;
  getStatus: (path: string | undefined) => Promise<ExtendedStatusResult>;
  onProcessStarted: (listener: (message: string) => void) => void;
  onDirectoryChanged: (
    listener: (status: ExtendedStatusResult, branches: BranchSummary) => void,
  ) => void;
};

const exposedApi: ContextBridgeApi = {
  getRepos: () => {
    // Send IPC event to main process
    ipcRenderer.send('get-repos');

    // Wrap a promise around the `.once` listener that will be sent back from
    // the main process
    return new Promise((resolve) => {
      ipcRenderer.once('get-repos-success', (_event, data: RepoPathProp[]) =>
        resolve(data),
      );
    });
  },

  getCurrent: () => {
    ipcRenderer.send('get-current');

    return new Promise((resolve) => {
      ipcRenderer.once('get-current-success', (_event, data: RepoPathProp) =>
        resolve(data),
      );
    });
  },

  saveCurrent: (path) => {
    ipcRenderer.send('set-current', path);

    return new Promise((resolve) => {
      ipcRenderer.once('set-current-success', (_event, data: RepoPathProp) =>
        resolve(data),
      );
    });
  },

  removeCurrent: () => {
    ipcRenderer.send('remove-current');
  },

  deleteRepo: (index) => {
    ipcRenderer.send('delete-repo', index);

    return new Promise((resolve) => {
      ipcRenderer.once('delete-repo-success', (_event, data: number) =>
        resolve(data),
      );
    });
  },

  savePath: (path) => {
    ipcRenderer.send('save-path', path);

    return new Promise((resolve) => {
      ipcRenderer.once('save-path-success', (_event, data: RepoPathProp) =>
        resolve(data),
      );
    });
  },

  getPath: () => {
    ipcRenderer.send('get-path');

    return new Promise((resolve) => {
      ipcRenderer.once('get-path-success', (_event, data: RepoPathProp) =>
        resolve(data),
      );
    });
  },

  getBranches: (path) => {
    ipcRenderer.send('get-branches', path);

    return new Promise((resolve) => {
      ipcRenderer.once('get-branches-success', (_event, data: BranchSummary) =>
        resolve(data),
      );
    });
  },

  getLog: (path) => {
    ipcRenderer.send('get-log', path);

    return new Promise((resolve) => {
      ipcRenderer.once('get-log-success', (_event, data: GitLogEntry[]) =>
        resolve(data),
      );
    });
  },

  checkoutBranch: (path, branch) => {
    ipcRenderer.send('checkout-branch', path, branch);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'checkout-branch-success',
        (_event, data: BranchSummary) => resolve(data),
      );
      ipcRenderer.once('checkout-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  addBranch: (path, name) => {
    ipcRenderer.send('add-branch', path, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('add-branch-success', (_event, data: BranchSummary) =>
        resolve(data),
      );
      ipcRenderer.once('add-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  addRemoteBranch: (path, selected, name) => {
    ipcRenderer.send('add-remote-branch', path, selected, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'add-remote-branch-success',
        (_event, data: BranchSummary) => resolve(data),
      );
      ipcRenderer.once('add-remote-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  deleteBranch: (path, name) => {
    ipcRenderer.send('delete-branch', path, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('delete-branch-success', (_event, data: BranchSummary) =>
        resolve(data),
      );
      ipcRenderer.once('delete-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  openFile: (path) => {
    ipcRenderer.send('open-file', path);
  },

  stageFile: (path, name) => {
    ipcRenderer.send('stage-file', path, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'stage-file-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('stage-file-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  unstageFile: (path, name) => {
    ipcRenderer.send('unstage-file', path, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'unstage-file-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('unstage-file-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  discard: (path, name) => {
    ipcRenderer.send('discard', path, name);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'discard-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('discard-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  discardAll: (path) => {
    ipcRenderer.send('discard-all', path);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'discard-all-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('discard-all-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  stageAll: (path) => {
    ipcRenderer.send('stage-all', path);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'stage-all-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('stage-all-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  stageAllUntracked: (path) => {
    ipcRenderer.send('stage-all-untracked', path);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'stage-all-untracked-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('stage-all-untracked-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  unstageAll: (path) => {
    ipcRenderer.send('unstage-all', path);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'unstage-all-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('unstage-all-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  commit: (path, message) => {
    ipcRenderer.send('commit', path, message);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('commit-success', (_event, data: ExtendedStatusResult) =>
        resolve(data),
      );
      ipcRenderer.once('commit-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  commitUnstaged: (path, message) => {
    ipcRenderer.send('commit-unstaged', path, message);

    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'commit-unstaged-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('commit-unstaged-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  pullBranch: (path, branch) => {
    ipcRenderer.send('pull-branch', path, branch);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('pull-branch-success', (_event, data: string) =>
        resolve(data),
      );
      ipcRenderer.once('pull-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  pushBranch: (path, branch, remote) => {
    ipcRenderer.send('push-branch', path, branch, remote);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('push-branch-success', (_event, data: string) =>
        resolve(data),
      );
      ipcRenderer.once('push-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  fetch: (path) => {
    ipcRenderer.send('fetch', path);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('fetch-branch-success', (_event, data: string) =>
        resolve(data),
      );
      ipcRenderer.once('fetch-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  mergeBranch: (path, selected, current) => {
    ipcRenderer.send('merge-branch', path, selected, current);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('merge-branch-success', (_event, data: string) =>
        resolve(data),
      );

      ipcRenderer.once('merge-branch-error', (_event, error) => {
        try {
          const parsedError = JSON.parse(error);

          const customError: ExtendMergeDetail = {
            name: parsedError.name,
            message: parsedError.message,
            git: parsedError.git as MergeDetail,
          };

          reject(customError);
        } catch (parseError) {
          console.error('Error parsing custom error:', parseError);
          reject(new Error('Failed to parse custom error'));
        }
      });
    });
  },

  getStatus: (path) => {
    // <--
    ipcRenderer.send('get-status', path);

    // -->
    return new Promise((resolve, reject) => {
      ipcRenderer.once(
        'get-status-success',
        (_event, data: ExtendedStatusResult) => resolve(data),
      );
      ipcRenderer.once('get-branch-error', (_event, error) =>
        reject(new Error(error)),
      );
    });
  },

  onProcessStarted: (listener) => {
    ipcRenderer.on('process-started', (_event, message) => listener(message));
  },

  onDirectoryChanged: (listener) => {
    ipcRenderer.on(
      'directory-changed',
      (_event, status: ExtendedStatusResult, branches: BranchSummary) =>
        listener(status, branches),
    );
  },
};

// Expose our functions in the `api` namespace of the renderer `Window`.
contextBridge.exposeInMainWorld('api', exposedApi);
