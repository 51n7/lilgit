import { RepoProps } from 'src/types';

function Branches({ branches }: RepoProps) {
  return (
    <div>
      <h1>Branches</h1>
      {branches &&
        Object.entries(branches.branches).map(([branchName, branchInfo]) => (
          <li key={branchName}>
            {branchInfo.commit} - {branchName}
            {/* <br />
            <strong>Commit:</strong> {branchInfo.commit}
            <br />
            <strong>Label:</strong> {branchInfo.label} */}
          </li>
        ))}
    </div>
  );
}

export default Branches;
