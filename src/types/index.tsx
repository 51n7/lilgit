import { BranchSummary } from 'simple-git';

export type RepoPathProp = {
  absolute: string;
  short: string;
};

export type RepoProps = {
  currentRepo?: string;
  branches?: BranchSummary;
};

export type TransformBranch = {
  id: number;
  current: boolean;
  name: string;
  commit: string;
  label: string;
};

export type TransformBranches = {
  local?: TransformBranch[];
  [remoteName: string]: TransformBranch[] | undefined;
};

export type ListItem = {
  id: number;
  text: string;
};

// export type BranchInfo = {
//   current: boolean;
//   linkedWorkTree: boolean;
//   name: string;
//   commit: string;
//   label: string;
// };

// export type Branches = {
//   [branchName: string]: BranchInfo;
// };

// export type RepositoryInfo = {
//   all: string[];
//   branches: Branches;
//   current: string;
//   detached: boolean;
// };
