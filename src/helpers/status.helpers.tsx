import { StatusResult } from 'simple-git';
import { TransformedStatus } from 'src/types';

export function convertGitResponse(
  response: StatusResult | undefined,
): TransformedStatus {
  if (!response || Object.keys(response).length === 0) {
    return {
      unstaged: [],
      untracked: [],
      staged: [],
    };
  }

  const transformedResponse: TransformedStatus = {};

  let idCounter = -1;

  response.files.forEach((file) => {
    if (
      response.modified.includes(file.path) &&
      !response.staged.includes(file.path)
    ) {
      if (!transformedResponse.unstaged) {
        transformedResponse.unstaged = [];
      }

      transformedResponse.unstaged.push({
        id: ++idCounter,
        path: file.path,
        status: file.working_dir,
      });
    }

    if (
      response.deleted.includes(file.path) &&
      !response.staged.includes(file.path)
    ) {
      if (!transformedResponse.unstaged) {
        transformedResponse.unstaged = [];
      }

      transformedResponse.unstaged.push({
        id: ++idCounter,
        path: file.path,
        status: file.working_dir,
      });
    }

    if (response.not_added.includes(file.path)) {
      if (!transformedResponse.untracked) {
        transformedResponse.untracked = [];
      }

      transformedResponse.untracked.push({
        id: ++idCounter,
        path: file.path,
        status: file.working_dir,
      });
    }

    if (response.staged.includes(file.path)) {
      if (!transformedResponse.staged) {
        transformedResponse.staged = [];
      }

      transformedResponse.staged.push({
        id: ++idCounter,
        path: file.path,
        status: file.index,
      });
    }
  });

  return transformedResponse;
}
