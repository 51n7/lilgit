import { BranchSummary } from 'simple-git';

export type RepoPathProp = {
  absolute: string;
  short: string;
};

export type RepoProps = {
  currentRepo?: string;
  branches?: BranchSummary;
  onBranchSelect?: (item: TransformBranch | undefined) => void;
  removeCurrentRepo: () => void;
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

// export type ListItem = {
//   id: number;
//   text: string;
// };

export type GitItem = {
  id?: number;
  path: string;
  status: string;
};

export type TransformedStatus = {
  [key: string]: GitItem[] | undefined;
  unstaged?: GitItem[];
  untracked?: GitItem[];
  staged?: GitItem[];
};
