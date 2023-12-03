import { BranchSummary, MergeDetail } from 'simple-git';

export type RepoPathProp = {
  absolute: string;
  short: string;
};

export type RepoProps = {
  currentRepo?: string;
  branches?: BranchSummary;
  onBranchCheckout?: (item: TransformBranch | undefined) => void;
  onLocalNew: (name: string) => void;
  onRemoteNew: (selected: string, name: string) => void;
  onBranchDelete: (name: string) => void;
  onBranchPull: (name: string) => void;
  onBranchPush: (name: string) => void;
  onBranchMerge: (selected: string, current: string) => void;
  removeCurrentRepo: () => void;
  outputOpen: boolean;
};

export type TransformBranch = {
  id: number;
  current: boolean;
  name: string;
  commit: string;
  label: string;
  remote: string;
};

export type TransformBranches = {
  local?: TransformBranch[];
  [remoteName: string]: TransformBranch[] | undefined;
};

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

export type GitLogEntry = {
  graph: string;
  commit: string | undefined;
  message: string | undefined;
  name: string | undefined;
  time: string | undefined;
};

export type ExtendMergeDetail = Error & {
  git?: MergeDetail;
};
