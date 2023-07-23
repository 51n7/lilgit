import { useEffect, useState } from 'react';
import { Repo } from 'src/types';
import { BranchSummary } from 'simple-git';

const App = () => {
  console.log('App');
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const [branchList, setBranchList] = useState<BranchSummary>();
  const [currentRepo, setCurrentRepo] = useState<string | undefined>();

  window.api.handleEventFromMain('key-press', (data) => {
    console.log('renderer:', data);
  });

  async function deleteRepo(index: number) {
    const tmpArray = [...repoList];
    tmpArray.splice(index, 1);
    setRepoList(tmpArray);

    await window.api.deleteRepo(index);
  }

  async function saveCurrentRepo(path: string) {
    setCurrentRepo(path);
    await window.api.saveCurrent(path);
  }

  function removeCurrentRepo() {
    setCurrentRepo(undefined);
    window.api.removeCurrent();
  }

  async function folderSelect() {
    const newPath = await window.api.getPath();

    if (newPath) {
      setRepoList((prevValue) => [
        ...prevValue,
        {
          label: newPath,
          value: newPath,
        },
      ]);

      await window.api.savePath(newPath);
    }
  }

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const current = await window.api.getCurrent();
        console.log(current);
        setCurrentRepo(current);
        setRepoList(await window.api.getRepos());
        setBranchList(await window.api.getBranches(current));
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    fetchRepos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setBranchList(await window.api.getBranches(currentRepo));
    };
    fetchData().catch(console.error);
  }, [currentRepo]);

  return (
    <div>
      {currentRepo && (
        <div>
          <h1>Branches</h1>
          <p>{currentRepo}</p>
          <br />
          <hr />
          <br />
          {branchList &&
            Object.entries(branchList.branches).map(
              ([branchName, branchInfo]) => (
                <li key={branchName}>
                  {branchInfo.commit} - {branchName}
                  {/* <br />
                  <strong>Commit:</strong> {branchInfo.commit}
                  <br />
                  <strong>Label:</strong> {branchInfo.label} */}
                </li>
              ),
            )}
          <br />
          <hr />
          <br />
          <button type='button' onClick={() => removeCurrentRepo()}>
            close
          </button>
        </div>
      )}
      {!currentRepo && (
        <div>
          {repoList &&
            repoList.map((type, index) => {
              return (
                <div key={type.label} className='repo-list'>
                  <button
                    type='button'
                    onClick={() => saveCurrentRepo(type.value)}
                  >
                    {type.label}
                  </button>
                  <button type='button' onClick={() => deleteRepo(index)}>
                    x
                  </button>
                </div>
              );
            })}

          <div>
            <br />
            <button type='button' onClick={folderSelect}>
              add repo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
