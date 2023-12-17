import { ExtendedStatusResult, GitItem, TransformedStatus } from 'src/types';

export function convertGitResponse(
  response: ExtendedStatusResult | undefined,
): TransformedStatus {
  const baseResponse = {
    unstaged: [],
    untracked: [],
    staged: [],
    'merge conflicts': [],
  };

  if (!response || Object.keys(response).length === 0) {
    return baseResponse;
  }

  const transformedResponse: TransformedStatus = baseResponse;
  let idCounter = -1;

  response.files.forEach((file) => {
    const transformedFile = {
      path: file.path,
      status: file.index !== ' ' ? file.index : file.working_dir,
    };

    if (
      response.modified.includes(file.path) &&
      !response.staged.includes(file.path)
    ) {
      transformedResponse.unstaged?.push(transformedFile);
    } else if (
      response.deleted.includes(file.path) &&
      !response.staged.includes(file.path)
    ) {
      transformedResponse.unstaged?.push(transformedFile);
    } else if (response.not_added.includes(file.path)) {
      transformedResponse.untracked?.push(transformedFile);
    } else if (response.staged.includes(file.path)) {
      transformedResponse.staged?.push(transformedFile);
    } else if (response.conflicted.includes(file.path)) {
      transformedResponse['merge conflicts']?.push(transformedFile);
    }
  });

  const addIdsToFileArray = (fileArray: GitItem[] | undefined): GitItem[] => {
    return (fileArray || []).map((file) => ({
      ...file,
      id: ++idCounter,
    }));
  };

  for (const key in transformedResponse) {
    if (Array.isArray(transformedResponse[key])) {
      transformedResponse[key] = addIdsToFileArray(transformedResponse[key]);

      if (!transformedResponse[key]?.length) {
        delete transformedResponse[key];
      }
    }
  }

  return transformedResponse;
}

export function findFileById(
  data: TransformedStatus | null,
  id: number,
): GitItem | undefined {
  // Check if data is null and return undefined
  if (data === null) {
    return undefined;
  }

  // Flatten the arrays while handling the optional nature of "local" array and remote arrays
  const allArrays = ([] as GitItem[]).concat(
    ...Object.values(data).filter(Array.isArray),
  );

  // Find the object with the specified id
  return allArrays.find((item) => item.id === id);
}
