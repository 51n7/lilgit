import { useEffect, useMemo, useState } from 'react';
import { RepoProps, TransformBranch } from 'src/types';
import NavigableList from './NavigableList';
import {
  findBranchById,
  transformBranch,
} from '../../../src/helpers/branches.helpers';
import Menu from './Menu';
import Dialog from './Dialog';

function Branches({ branches, onBranchSelect, removeCurrentRepo }: RepoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const transformBranches = branches ? transformBranch(branches) : null;
  const branchesLength = branches
    ? Object.keys(branches.branches).length
    : null;

  const handleItemClick = (item: TransformBranch) => {
    console.log('Selected item:', item.name);
    setSelectedIndex(item.id);
  };

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

            if (onBranchSelect) {
              onBranchSelect(selectedBranch);
            }
          }
        },
      },
      {
        key: 'b',
        description: 'create from selected branch',
        function: () => {
          // console.log('b key was hit in branch view');
          setShowDialog((showDialog) => !showDialog);
        },
      },
      {
        key: 'd',
        description: 'delete',
        function: () => {
          console.log('delete');
        },
      },
      {
        key: 'p',
        description: 'push selected to remote',
        function: () => {
          console.log('push');
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
          console.log('merge');
        },
      },
      {
        key: 'Escape',
        function: () => {
          if (!showMenu && !showDialog) {
            setSelectedIndex(null);
            removeCurrentRepo();
          }
        },
      },
    ],
    [
      onBranchSelect,
      removeCurrentRepo,
      selectedIndex,
      showDialog,
      showMenu,
      transformBranches,
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

    if (!showMenu && !showDialog) {
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
    onBranchSelect,
    showMenu,
    showDialog,
  ]);

  return (
    <div className='view-branches'>
      {transformBranches &&
        Object.keys(transformBranches).map((section) => (
          <div key={section}>
            <p className='text-red'>
              {section === 'local' ? 'LOCAL:' : `REMOTE (${section}):`}
            </p>
            <NavigableList
              items={transformBranches[section]}
              selectedIndex={selectedIndex}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}
      <Menu options={keyMap} isOpen={showMenu} setIsOpen={setShowMenu} />
      <Dialog isOpen={showDialog} setIsOpen={setShowDialog} />
    </div>
  );
}

export default Branches;
