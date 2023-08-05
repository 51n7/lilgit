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
    return {
      id,
      current: branchData.current,
      name: branchData.name,
      commit: branchData.commit,
      label: branchData.label,
    };
  };

  // Extract other branches' details and group by remote
  for (const branchName of all) {
    const branch = branches[branchName];
    if (branch) {
      if (!branchName.startsWith('remotes/')) {
        localBranches.push(mapBranch(branch, nextId));
      } else {
        const remoteName = branchName.substring(8, branchName.indexOf('/', 9));
        const remoteBranch = mapBranch(branch, nextId);

        if (!remoteBranches[remoteName]) {
          remoteBranches[remoteName] = [];
        }

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
  const allArrays = ([] as TransformBranch[]).concat(
    ...Object.values(data).filter(Array.isArray),
  );

  // Find the object with the specified id
  return allArrays.find((item) => item.id === id);
}
