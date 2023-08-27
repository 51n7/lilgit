import { useEffect, useMemo, useState } from 'react';
import { RepoProps, TransformBranch } from 'src/types';
import NavigableList from './NavigableList';
import {
  findBranchById,
  transformBranch,
} from '../../../src/helpers/branches.helpers';
import Menu from './Menu';

function Branches({ branches, onBranchSelect, removeCurrentRepo }: RepoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
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
        description: 'checkout branch',
        function: () => {
          console.log('c key was hit in branch view');
        },
      },
      {
        key: 'b',
        description: 'new branch',
        function: () => {
          console.log('b key was hit in branch view');
        },
      },
      {
        key: 'escape',
        function: () => {
          setShowMenu(false);

          if (!showMenu) {
            setSelectedIndex(null);
            removeCurrentRepo();
          }
        },
      },
    ],
    [removeCurrentRepo, showMenu],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const branchLength = branchesLength !== null ? branchesLength : 0;
      const pressedKey = event.key.toLowerCase();
      const mappedFunction = keyMap.find((item) => item.key === pressedKey);
      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            if (prevIndex === null || prevIndex === 0) {
              return branchLength - 1;
            } else {
              return prevIndex - 1;
            }
          });
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            if (prevIndex === null || prevIndex === branchLength - 1) {
              return 0;
            } else {
              return prevIndex + 1;
            }
          });
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        // if (selectedIndex !== null) {
        //   const selectedBranch = findBranchById(
        //     transformBranches,
        //     selectedIndex,
        //   );

        //   if (onBranchSelect) {
        //     onBranchSelect(selectedBranch);
        //   }
        // }
      } else if (event.shiftKey && event.code == 'Slash') {
        setShowMenu((showMenu) => !showMenu);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    keyMap,
    selectedIndex,
    transformBranches,
    branchesLength,
    onBranchSelect,
    showMenu,
  ]);

  return (
    <div className='view-branches'>
      {/* <header>
        <p>
          <em>Repo:</em> {currentRepo}
        </p>
        <p>
          <em>Branch:</em> On branch{' '}
          <span className='text-blue'>`{branches?.current}`</span>
        </p>
      </header> */}

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
      <Menu options={keyMap} isOpen={showMenu} />
    </div>
  );
}

export default Branches;
