import { useEffect, useState } from 'react';
import { RepoPathProp, TransformBranch } from 'src/types';
import { BranchSummary } from 'simple-git';
import Status from './Status';
import Branches from './Branches';
import Graph from './Graph';
import RepoList from './RepoList';

const App = () => {
  const [repoList, setRepoList] = useState<RepoPathProp[]>([]);
  const [branchList, setBranchList] = useState<BranchSummary>();
  const [currentRepo, setCurrentRepo] = useState<RepoPathProp | undefined>();
  const [viewState, setViewState] = useState<number>(0);
  const views = [
    <Status currentRepo={currentRepo?.short} branches={branchList} />,
    <Branches
      currentRepo={currentRepo?.short}
      branches={branchList}
      onBranchSelect={updateBranches}
    />,
    <Graph />,
  ];

  async function deleteRepo(index: number) {
    if (index > 0) {
      const tmpArray = [...repoList];
      tmpArray.splice(index, 1);
      setRepoList(tmpArray);

      await window.api.deleteRepo(index);
    }
  }

  async function saveCurrentRepo(repo: RepoPathProp) {
    setCurrentRepo(repo);
    await window.api.saveCurrent(repo);
  }

  function removeCurrentRepo() {
    setCurrentRepo(undefined);
    window.api.removeCurrent();
  }

  async function updateBranches(item: TransformBranch | undefined) {
    setBranchList(
      await window.api.checkoutBranch(currentRepo?.absolute, item?.name ?? ''),
    );
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
        const repo = await window.api.getCurrent();
        setCurrentRepo(repo);
        setRepoList(await window.api.getRepos());
        setBranchList(await window.api.getBranches(repo?.absolute));
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
      if (e.code == 'Escape') {
        removeCurrentRepo();
        // console.log('Escape');
      }
    };
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp); // clean up the event listener on unmount
    };
  }, [viewState, views.length]);

  useEffect(() => {
    const fetchData = async () => {
      setBranchList(await window.api.getBranches(currentRepo?.absolute));
    };
    fetchData().catch(console.error);
  }, [currentRepo]);

  return (
    <>
      {currentRepo && views[viewState]}
      {!currentRepo && (
        <RepoList
          list={repoList}
          onRepoSave={saveCurrentRepo}
          onRepoDelete={deleteRepo}
          addRepo={folderSelect}
        />
      )}
    </>
  );
};

export default App;
