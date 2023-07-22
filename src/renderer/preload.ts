// src/preload.ts

// `contextBridge` expose an API to the renderer process.
// `ipcRenderer` is used for IPC (inter-process communication) with main process.
// We use it in the preload instead of renderer in order to expose only
// whitelisted wrappers to increase the security of our aplication.
import { contextBridge, ipcRenderer } from 'electron';
import { Repo } from 'src/types';
import { BranchSummary } from 'simple-git';

// Create a type that should contain all the data we need to expose in the
// renderer process using `contextBridge`.
export type ContextBridgeApi = {
  getRepos: () => Promise<Repo[]>;
  getCurrent: () => Promise<string>;
  saveCurrent: (path: string) => Promise<string>;
  removeCurrent: () => void;
  deleteRepo: (index: number) => Promise<number>;
  savePath: (path: string) => Promise<string>;
  getPath: () => Promise<string>;
  getBranches: (path: string | undefined) => Promise<BranchSummary>;
};

const exposedApi: ContextBridgeApi = {
  getRepos: () => {
    // Send IPC event to main process to read the file.
    ipcRenderer.send('get-repos');

    // Wrap a promise around the `.once` listener that will be sent back from
    // the main process, once the file has been read.
    return new Promise((resolve) => {
      ipcRenderer.once('get-repos-success', (_event, data: Repo[]) =>
        resolve(data),
      );
    });
  },

  getCurrent: () => {
    ipcRenderer.send('get-current');

    return new Promise((resolve) => {
      ipcRenderer.once('get-current-success', (_event, data: string) =>
        resolve(data),
      );
    });
  },

  saveCurrent: (path) => {
    ipcRenderer.send('set-current', path);

    return new Promise((resolve) => {
      ipcRenderer.once('set-current-success', (_event, data: string) =>
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
      ipcRenderer.once('save-path-success', (_event, data: string) =>
        resolve(data),
      );
    });
  },

  getPath: () => {
    ipcRenderer.send('get-path');

    return new Promise((resolve) => {
      ipcRenderer.once('get-path-success', (_event, data: string) =>
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
};

// Expose our functions in the `api` namespace of the renderer `Window`.
contextBridge.exposeInMainWorld('api', exposedApi);
