import { useEffect, useState } from 'react';
import { RepoPathProp, TransformBranch, GitLogEntry } from 'src/types';
import { StatusResult, BranchSummary } from 'simple-git';
import Status from './Status';
import Branches from './Branches';
import Graph from './Graph';
import RepoList from './RepoList';
import ErrorNotification from './ErrorNotification';
import Output from './Output';

const App = () => {
  const [repoList, setRepoList] = useState<RepoPathProp[]>([]);
  const [currentRepo, setCurrentRepo] = useState<RepoPathProp | undefined>();
  const [status, setStatus] = useState<StatusResult>();
  const [branchList, setBranchList] = useState<BranchSummary>();
  const [graphList, setGraphList] = useState<GitLogEntry[]>();
  const [viewState, setViewState] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const views = [
    <Status
      status={status}
      onFileStage={onFileStage}
      onFileUnstage={onFileUnstage}
      onFileDiscard={onFileDiscard}
      onDiscard={onDiscard}
      stageAll={stageAll}
      stageAllUntracked={stageAllUntracked}
      unstageAll={unstageAll}
      commitUnstaged={commitUnstaged}
      commit={commit}
      removeCurrentRepo={removeCurrentRepo}
    />,
    <Branches
      branches={branchList}
      onBranchCheckout={updateBranches}
      onBranchNew={addBranch}
      onBranchDelete={deleteBranch}
      onBranchPull={pullBranch}
      onBranchPush={pushBranch}
      onBranchMerge={mergeBranch}
      removeCurrentRepo={removeCurrentRepo}
    />,
    <Graph graph={graphList} removeCurrentRepo={removeCurrentRepo} />,
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
    setViewState(0);
    await window.api.saveCurrent(repo);
  }

  function removeCurrentRepo() {
    setCurrentRepo(undefined);
    window.api.removeCurrent();
  }

  async function onFileStage(name: string) {
    try {
      setStatus(await window.api.stageFile(currentRepo?.absolute, name));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function onFileUnstage(name: string) {
    try {
      setStatus(await window.api.unstageFile(currentRepo?.absolute, name));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function onFileDiscard(name: string) {
    try {
      setStatus(await window.api.discard(currentRepo?.absolute, name));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function onDiscard() {
    try {
      setStatus(await window.api.discardAll(currentRepo?.absolute));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function stageAll() {
    try {
      setStatus(await window.api.stageAll(currentRepo?.absolute));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function stageAllUntracked() {
    try {
      setStatus(await window.api.stageAllUntracked(currentRepo?.absolute));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function unstageAll() {
    try {
      setStatus(await window.api.unstageAll(currentRepo?.absolute));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function commitUnstaged(message: string) {
    try {
      setStatus(
        await window.api.commitUnstaged(currentRepo?.absolute, message),
      );
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function commit(message: string) {
    try {
      setStatus(await window.api.commit(currentRepo?.absolute, message));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function updateBranches(item: TransformBranch | undefined) {
    setBranchList(
      await window.api.checkoutBranch(currentRepo?.absolute, item?.name ?? ''),
    );
  }

  async function addBranch(name: string) {
    try {
      setBranchList(await window.api.addBranch(currentRepo?.absolute, name));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function deleteBranch(name: string) {
    try {
      setBranchList(await window.api.deleteBranch(currentRepo?.absolute, name));
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function pullBranch(branch: string) {
    try {
      await window.api.pullBranch(currentRepo?.absolute, branch);
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function pushBranch(branch: string) {
    try {
      await window.api.pushBranch(currentRepo?.absolute, branch);
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function mergeBranch(selected: string, current: string) {
    try {
      await window.api.mergeBranch(currentRepo?.absolute, selected, current);
    } catch (error) {
      setError((error as Error).message);
    }
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
        setCurrentRepo(await window.api.getCurrent());
        setRepoList(await window.api.getRepos());
        setBranchList(await window.api.getBranches(repo?.absolute));
        setStatus(await window.api.getStatus(repo?.absolute));
        setGraphList(await window.api.getLog(repo?.absolute));
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
        // removeCurrentRepo();
      }
    };
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp); // clean up the event listener on unmount
    };
  }, [viewState, views.length, currentRepo]);

  useEffect(() => {
    const fetchData = async () => {
      setBranchList(await window.api.getBranches(currentRepo?.absolute));
      setStatus(await window.api.getStatus(currentRepo?.absolute));
      setGraphList(await window.api.getLog(currentRepo?.absolute));
    };
    fetchData().catch(console.error);
  }, [currentRepo]);

  return (
    <>
      {currentRepo && (
        <div className='pad'>
          <div className='dot-nav' data-view={viewState + 1}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <header>
            <p>
              <em>Repo:</em> {currentRepo.short}
            </p>
            {status?.current && (
              <p>
                <em>Branch:</em> On branch{' '}
                <span className='text-blue'>`{status?.current}`</span> tracking{' '}
                <span className='text-blue'>`{status?.tracking}`</span>
              </p>
            )}
          </header>
          {views[viewState]}
        </div>
      )}
      {!currentRepo && (
        <RepoList
          list={repoList}
          onRepoSave={saveCurrentRepo}
          onRepoDelete={deleteRepo}
          addRepo={folderSelect}
        />
      )}
      {error && (
        <ErrorNotification message={error} clearError={() => setError(null)} />
      )}
      <Output />
    </>
  );
};

export default App;
