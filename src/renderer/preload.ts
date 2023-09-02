// src/preload.ts

// `contextBridge` expose an API to the renderer process.
// `ipcRenderer` is used for IPC (inter-process communication) with main process.
// We use it in the preload instead of renderer in order to expose only
// whitelisted wrappers to increase the security of our aplication.
import { contextBridge, ipcRenderer } from 'electron';
import { RepoPathProp } from 'src/types';
import { BranchSummary, StatusResult } from 'simple-git';

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
  checkoutBranch: (
    path: string | undefined,
    branch: string,
  ) => Promise<BranchSummary>;
  addBranch: (path: string | undefined, name: string) => Promise<BranchSummary>;
  deleteBranch: (
    path: string | undefined,
    name: string,
  ) => Promise<BranchSummary>;
  getStatus: (path: string | undefined) => Promise<StatusResult>;
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

  checkoutBranch: (path, branch) => {
    ipcRenderer.send('checkout-branch', path, branch);

    return new Promise((resolve) => {
      ipcRenderer.once(
        'checkout-branch-success',
        (_event, data: BranchSummary) => resolve(data),
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

  deleteBranch: (path, name) => {
    ipcRenderer.send('delete-branch', path, name);

    return new Promise((resolve) => {
      ipcRenderer.once('delete-branch-success', (_event, data: BranchSummary) =>
        resolve(data),
      );
    });
  },

  getStatus: (path) => {
    // <--
    ipcRenderer.send('get-status', path);

    // -->
    return new Promise((resolve) => {
      ipcRenderer.once('get-status-success', (_event, data: StatusResult) =>
        resolve(data),
      );
    });
  },
};

// Expose our functions in the `api` namespace of the renderer `Window`.
contextBridge.exposeInMainWorld('api', exposedApi);
