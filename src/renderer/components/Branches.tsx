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
  onBranchNew,
  onBranchDelete,
  onBranchPull,
  onBranchPush,
  onBranchMerge,
  removeCurrentRepo,
}: RepoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [newBranchDialog, setNewBranchDialog] = useState<boolean>(false);
  const transformBranches = branches ? transformBranch(branches) : null;
  const branchesLength = branches
    ? Object.keys(branches.branches).length
    : null;

  const handleItemClick = (item: TransformBranch) => {
    console.log('Selected item:', item.name);
    setSelectedIndex(item.id);
  };

  // const handleNewBranchDialog = (name: string) => {
  //   onBranchNew(name);
  // };

  const keyMap = useMemo(
    () => [
      {
        key: 'c',
        description: 'checkout',
        function: () => {
          if (selectedIndex !== null) {
            const selectedBranch = findBranchById(
              transformBranches,
              selectedIndex,
            );

            if (onBranchCheckout) {
              onBranchCheckout(selectedBranch);
            }
          }
        },
      },
      {
        key: 'b',
        description: 'create from selected branch',
        function: () => {
          if (selectedIndex !== null) {
            setNewBranchDialog((showDialog) => !showDialog);
          }
        },
      },
      {
        key: 'd',
        description: 'delete',
        function: () => {
          if (selectedIndex !== null) {
            const selectedBranch = findBranchById(
              transformBranches,
              selectedIndex,
            );

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
            const selectedBranch = findBranchById(
              transformBranches,
              selectedIndex,
            );

            onBranchPull(selectedBranch?.name ?? '');
          }
        },
      },
      {
        key: 'P',
        description: 'push selected to remote',
        function: () => {
          if (selectedIndex !== null) {
            const selectedBranch = findBranchById(
              transformBranches,
              selectedIndex,
            );

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
            const selectedBranch = findBranchById(
              transformBranches,
              selectedIndex,
            );

            onBranchMerge(selectedBranch?.name ?? '', branches?.current ?? '');
          }
        },
      },
      {
        key: 'Escape',
        function: () => {
          if (!showMenu && !newBranchDialog) {
            setSelectedIndex(null);
            removeCurrentRepo();
          }
        },
      },
    ],
    [
      selectedIndex,
      transformBranches,
      onBranchCheckout,
      onBranchDelete,
      onBranchPull,
      onBranchPush,
      onBranchMerge,
      branches,
      showMenu,
      newBranchDialog,
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
          if (prevIndex === null || prevIndex === 0) {
            return branchLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === branchLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.shiftKey && event.code == 'Slash') {
        setShowMenu((showMenu) => !showMenu);
      }
    };

    if (!showMenu && !newBranchDialog) {
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
    newBranchDialog,
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
        isOpen={newBranchDialog}
        setIsOpen={setNewBranchDialog}
        onSubmit={(name) => {
          onBranchNew(name);
        }}
      />
    </div>
  );
}

export default Branches;
