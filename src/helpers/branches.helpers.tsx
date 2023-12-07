import { BranchSummary, BranchSummaryBranch } from 'simple-git';
import { TransformBranch, TransformBranches } from 'src/types';

export function transformBranch(input: BranchSummary): TransformBranches {
  const { all, branches } = input;
  const localBranches: TransformBranch[] = [];
  const remoteBranches: { [key: string]: TransformBranch[] } = {};
  let nextId = localBranches.length;

  // Helper function to map branch details to TransformBranch format
  const mapBranch = (
    branchData: BranchSummaryBranch,
    id: number,
  ): TransformBranch => {
    const { current, name, commit, label } = branchData;
    return {
      id,
      current,
      name,
      commit,
      label,
      remote: '',
    };
  };

  // Extract other branches details and group by remote
  for (const branchName of all) {
    const branch = branches[branchName];
    if (branch) {
      if (!branchName.startsWith('remotes/')) {
        localBranches.push(mapBranch(branch, nextId));
      } else {
        const branchSlice = branchName.split('/'); // ["remotes", "origin", "main"]
        const remote = branchSlice
          .slice(0, 2)
          .concat(branchSlice.slice(2).join('/'));
        const remoteName = remote[1];
        const remoteBranch = mapBranch(branch, nextId);

        if (!remoteBranches[remoteName]) {
          remoteBranches[remoteName] = [];
        }

        remoteBranch.name = remote.pop() || '';
        remoteBranches[remoteName].push(remoteBranch);
      }
      nextId++;
    }
  }

  // Create the final transformed data
  const TransformBranches: TransformBranches = {};
  if (localBranches.length > 0) {
    TransformBranches.local = localBranches;
  }

  for (const remoteName in remoteBranches) {
    TransformBranches[remoteName] = remoteBranches[remoteName];
  }

  return TransformBranches;
}

export function findBranchById(
  data: TransformBranches | null,
  id: number,
): TransformBranch | undefined {
  // Check if data is null and return undefined
  if (data === null) {
    return undefined;
  }

  // Flatten the arrays while handling the optional nature of "local" array and remote arrays
  const allArrays: TransformBranch[] = ([] as TransformBranch[]).concat(
    ...Object.keys(data).flatMap((key) =>
      (data[key] || []).map((branch) => ({ ...branch, remote: key })),
    ),
  );

  // Find the object with the specified id
  return allArrays.find((item) => item.id === id);
}
