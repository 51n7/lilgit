import { useEffect, useState } from 'react';
import { RepoPathProp } from 'src/types';
import { BranchSummary } from 'simple-git';
import Status from './Status';
import Branches from './Branches';
import Graph from './Graph';

const App = () => {
  const [repoList, setRepoList] = useState<RepoPathProp[]>([]);
  const [branchList, setBranchList] = useState<BranchSummary>();
  const [currentRepo, setCurrentRepo] = useState<string | undefined>();
  const [viewState, setViewState] = useState<number>(0);
  const views = [
    <Status currentRepo={currentRepo} />,
    <Branches branches={branchList} />,
    <Graph />,
  ];

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
    const newRepo = await window.api.getPath();

    if (newRepo) {
      setRepoList((prevValue) => [...prevValue, newRepo]);
      await window.api.savePath(newRepo);
    }
  }

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const current = await window.api.getCurrent();
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
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey && e.code == 'Tab') {
        setViewState(viewState === views.length - 1 ? 0 : viewState + 1);
      }
      if (e.shiftKey && e.code == 'Tab') {
        setViewState(viewState === 0 ? views.length - 1 : viewState - 1);
      }
    };
    window.addEventListener('keyup', handleKeyUp);

    // clean up the event listener on unmount
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewState, views.length]);

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
          {views[viewState]}
          <button
            type='button'
            className='closeRepo'
            onClick={() => removeCurrentRepo()}
          >
            back
          </button>
        </div>
      )}
      {!currentRepo && (
        <div>
          {repoList &&
            repoList.map((type, index) => {
              return (
                <div key={type.short} className='repo-list'>
                  <button
                    type='button'
                    onClick={() => saveCurrentRepo(type.absolute)}
                  >
                    {type.short}
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
