import { BranchSummary } from 'simple-git';

export type Repo = {
  label: string;
  value: string;
};

export type RepoProps = {
  currentRepo?: string;
  branches?: BranchSummary;
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
