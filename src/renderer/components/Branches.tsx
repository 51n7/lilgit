import { useEffect, useMemo, useState } from 'react';
import { RepoProps, TransformBranch } from 'src/types';
import BranchesList from './BranchesList';
import {
  findBranchById,
  transformBranch,
} from '../../../src/helpers/branches.helpers';
import Menu from './Menu';
import Dialog from './Dialog';

function Branches({
  branches,
  onBranchCheckout,
  onLocalNew,
  onRemoteNew,
  onBranchDelete,
  onBranchPull,
  onBranchPush,
  onBranchMerge,
  removeCurrentRepo,
  outputOpen,
}: RepoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<
    TransformBranch | undefined
  >();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [newLocalBranchDialog, setNewLocalBranchDialog] =
    useState<boolean>(false);
  const [newRemoteBranchDialog, setNewRemoteBranchDialog] =
    useState<boolean>(false);
  const transformBranches = branches ? transformBranch(branches) : null;
  const branchesLength = branches
    ? Object.keys(branches.branches).length
    : null;

  const handleItemClick = (item: TransformBranch) => {
    setSelectedIndex(item.id);
    setSelectedBranch(findBranchById(transformBranches, item.id));
  };

  const keyMap = useMemo(
    () => [
      {
        key: 'c',
        description: 'checkout',
        function: () => {
          if (onBranchCheckout && selectedIndex !== null) {
            onBranchCheckout(selectedBranch);
          }
        },
      },
      {
        key: 'b',
        description: 'create from selected branch',
        function: () => {
          if (selectedIndex !== null) {
            if (selectedBranch?.remote === 'local') {
              setNewLocalBranchDialog((showDialog) => !showDialog);
            } else {
              setNewRemoteBranchDialog((showDialog) => !showDialog);
            }
          }
        },
      },
      {
        key: 'd',
        description: 'delete',
        function: () => {
          if (selectedIndex !== null) {
            if (onBranchCheckout) {
              onBranchDelete(selectedBranch?.name ?? '');
            }
          }
        },
      },
      {
        key: 'p',
        description: 'pull selected branch',
        function: () => {
          if (selectedIndex !== null) {
            onBranchPull(selectedBranch?.name ?? '');
          }
        },
      },
      {
        key: 'P',
        description: 'push selected to remote',
        function: () => {
          if (selectedIndex !== null) {
            onBranchPush(selectedBranch?.name ?? '');
          }
        },
      },
      {
        key: 'f',
        description: 'fetch remote branches',
        function: () => {
          console.log('fetch');
        },
      },
      {
        key: 'm',
        description: 'merge selected into active branch',
        function: () => {
          if (selectedIndex !== null) {
            onBranchMerge(selectedBranch?.name ?? '', branches?.current ?? '');
          }
        },
      },
      {
        key: 'Escape',
        function: () => {
          if (!showMenu && !outputOpen && !newLocalBranchDialog) {
            setSelectedIndex(null);
            removeCurrentRepo();
          }
        },
      },
    ],
    [
      onBranchCheckout,
      selectedIndex,
      selectedBranch,
      onBranchDelete,
      onBranchPull,
      onBranchPush,
      onBranchMerge,
      branches,
      showMenu,
      outputOpen,
      newLocalBranchDialog,
      removeCurrentRepo,
    ],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const branchLength = branchesLength !== null ? branchesLength : 0;
      const mappedFunction = keyMap.find((item) => item.key === event.key);

      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          let newIndex;
          if (prevIndex === null || prevIndex === 0) {
            newIndex = branchLength - 1;
          } else {
            newIndex = prevIndex - 1;
          }
          setSelectedBranch(findBranchById(transformBranches, newIndex));
          return newIndex;
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          let newIndex;
          if (prevIndex === null || prevIndex === branchLength - 1) {
            newIndex = 0;
          } else {
            newIndex = prevIndex + 1;
          }
          setSelectedBranch(findBranchById(transformBranches, newIndex));
          return newIndex;
        });
      } else if (event.shiftKey && event.code == 'Slash') {
        setShowMenu((showMenu) => !showMenu);
      }
    };

    if (!showMenu && !newLocalBranchDialog && !newRemoteBranchDialog) {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [
    keyMap,
    selectedIndex,
    transformBranches,
    branchesLength,
    onBranchCheckout,
    showMenu,
    newLocalBranchDialog,
    newRemoteBranchDialog,
  ]);

  return (
    <div className='view-branches'>
      {transformBranches &&
        Object.keys(transformBranches).map((section) => (
          <div key={section}>
            <p className='text-red'>
              {section === 'local' ? 'LOCAL:' : `REMOTE (${section}):`}
            </p>
            <BranchesList
              items={transformBranches[section]}
              selectedIndex={selectedIndex}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}
      <Menu options={keyMap} isOpen={showMenu} setIsOpen={setShowMenu} />
      <Dialog
        title='New branch'
        isOpen={newLocalBranchDialog}
        setIsOpen={setNewLocalBranchDialog}
        onSubmit={(name) => {
          onLocalNew(name);
        }}
      />
      <Dialog
        title='New branch'
        defaultValue={selectedBranch?.name}
        isOpen={newRemoteBranchDialog}
        setIsOpen={setNewRemoteBranchDialog}
        onSubmit={(name) => {
          onRemoteNew(
            `${selectedBranch?.remote}/${selectedBranch?.name}`,
            name,
          );
        }}
      />
    </div>
  );
}

export default Branches;
