import { RepoProps } from 'src/types';

function Status({ currentRepo }: RepoProps) {
  return (
    <div>
      <h1>Status</h1>
      <p>Current Repo: {currentRepo}</p>
    </div>
  );
}

export default Status;
