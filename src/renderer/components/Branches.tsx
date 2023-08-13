import { useEffect, useMemo, useState } from 'react';
import { RepoProps, TransformBranch } from 'src/types';
import NavigableList from './NavigableList';
import {
  findBranchById,
  transformBranch,
} from '../../../src/helpers/branches.helpers';

function Branches({ currentRepo, branches, onBranchSelect }: RepoProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
        key: 's',
        function: () => {
          console.log('s key was hit in branch view');
        },
      },
      {
        key: 'a',
        function: () => {
          console.log('a key was hit in branch view');
        },
      },
    ],
    [],
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
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedIndex !== null) {
          const selectedBranch = findBranchById(
            transformBranches,
            selectedIndex,
          );

          if (onBranchSelect) {
            onBranchSelect(selectedBranch);
          }
        }
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
  ]);

  return (
    <div>
      <h1>Branches</h1>
      <p>Repo: {currentRepo}</p>
      <p>Current: {branches?.current}</p>
      <br />
      <hr />
      <br />

      {transformBranches &&
        Object.keys(transformBranches).map((section) => (
          <div key={section}>
            <h2>{section === 'local' ? section : `remote: ${section}`}</h2>
            <NavigableList
              items={transformBranches[section]}
              selectedIndex={selectedIndex}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}
    </div>
  );
}

export default Branches;
