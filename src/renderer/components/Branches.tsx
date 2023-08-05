import { useEffect, useMemo, useState } from 'react';
import { RepoProps, TransformBranch } from 'src/types';
import NavigableList from './NavigableList';
import {
  findBranchById,
  transformBranch,
} from '../../../src/helpers/branches.helpers';

function Branches({ currentRepo, branches }: RepoProps) {
  const [testIndex, setTestIndex] = useState<number | null>(null);
  const transformBranches = branches ? transformBranch(branches) : null;
  const branchesLength = branches
    ? Object.keys(branches.branches).length
    : null;

  const handleItemClick = (item: TransformBranch) => {
    console.log('Selected item:', item.name);
    setTestIndex(item.id);
  };

  const keyMap = useMemo(
    () => [
      {
        key: 's',
        function: () => {
          console.log('s key was hit in branch');
        },
      },
      {
        key: 'a',
        function: () => {
          console.log('a key was hit in branch');
        },
      },
    ],
    [],
  );

  async function checkoutBranch(branch: string) {
    await window.api.checkoutBranch(currentRepo, branch);
  }

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
        setTestIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return branchLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setTestIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === branchLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (testIndex !== null) {
          console.log(findBranchById(transformBranches, testIndex));
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap, testIndex, transformBranches, branchesLength]);

  return (
    <div>
      <h1>Branches</h1>
      <p>Current: {branches?.current}</p>
      <br />
      <hr />
      <br />

      {transformBranches &&
        Object.keys(transformBranches).map((section) => (
          <div key={section}>
            <h2>{section}</h2>
            <NavigableList
              items={transformBranches[section]}
              selectedIndex={testIndex}
              onItemClick={handleItemClick}
            />
          </div>
        ))}
    </div>
  );
}

export default Branches;
