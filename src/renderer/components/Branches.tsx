import { useEffect, useMemo, useState } from 'react';
import { RepoProps } from 'src/types';
import NavigableList from './NavigableList';
import { BranchSummary } from 'simple-git';
// import List from './List';

interface ListItem {
  id: number;
  text: string;
}

interface BranchData {
  current: boolean;
  linkedWorkTree: boolean;
  name: string;
  commit: string;
  label: string;
}

interface TransformData {
  id: number;
  current: boolean;
  name: string;
  commit: string;
  label: string;
}

interface TransformedData {
  local?: TransformData[];
  [remoteName: string]: TransformData[] | TransformData[] | undefined;
}

function Branches({ currentRepo, branches }: RepoProps) {
  const [testIndex, setTestIndex] = useState<number | null>(null);

  // console.log(branches);

  // const list1 = [
  //   { id: 0, text: 'Item 1' },
  //   { id: 1, text: 'Item 2' },
  //   { id: 2, text: 'Item 3' },
  // ];

  // const list2 = [
  //   { id: 3, text: 'Item 4' },
  //   { id: 4, text: 'Item 5' },
  //   { id: 5, text: 'Item 6' },
  // ];

  // const mergedList = [...list1, ...list2];

  const list1 = useMemo(
    () => [
      { id: 0, text: 'Item 1' },
      { id: 1, text: 'Item 2' },
      { id: 2, text: 'Item 3' },
    ],
    [],
  );

  const list2 = useMemo(
    () => [
      { id: 3, text: 'Item 4' },
      { id: 4, text: 'Item 5' },
      { id: 5, text: 'Item 6' },
    ],
    [],
  );

  const mergedList = useMemo(() => [...list1, ...list2], [list1, list2]);

  const handleItemClick = (item: ListItem) => {
    console.log('Selected item:', item.text);
    setTestIndex(item.id);
  };

  function transformData(input: BranchSummary): TransformedData {
    const { all, branches } = input;
    const localBranches: TransformData[] = [];
    const remoteBranches: { [key: string]: TransformData[] } = {};
    let nextId = localBranches.length + 1;

    // Helper function to map branch details to TransformData format
    const mapToTransformData = (
      branchData: BranchData,
      id: number,
    ): TransformData => {
      return {
        id,
        current: branchData.current,
        name: branchData.name,
        commit: branchData.commit,
        label: branchData.label,
      };
    };

    // Extract other branches' details and group by remote
    for (const branchName of all) {
      const branch = branches[branchName];
      if (branch) {
        if (!branchName.startsWith('remotes/')) {
          localBranches.push(mapToTransformData(branch, nextId));
        } else {
          const remoteName = branchName.substring(
            8,
            branchName.indexOf('/', 9),
          );
          const remoteBranch = mapToTransformData(branch, nextId);

          if (!remoteBranches[remoteName]) {
            remoteBranches[remoteName] = [];
          }

          remoteBranches[remoteName].push(remoteBranch);
        }
        nextId++;
      }
    }

    // Create the final transformed data
    const transformedData: TransformedData = {};
    if (localBranches.length > 0) {
      transformedData.local = localBranches;
    }

    for (const remoteName in remoteBranches) {
      transformedData[remoteName] = remoteBranches[remoteName];
    }

    return transformedData;
  }

  const transformedData = branches ? transformData(branches) : null;
  console.log(transformedData);

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
      const pressedKey = event.key.toLowerCase();
      const mappedFunction = keyMap.find((item) => item.key === pressedKey);
      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setTestIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return mergedList.length - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setTestIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === mergedList.length - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (testIndex !== null) {
          // handleItemClick(mergedList[testIndex]);
          console.log('Update item:', mergedList[testIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap, testIndex, mergedList]);

  return (
    <div>
      <h1>Branches</h1>
      <p>Current: {branches?.current}</p>
      <br />
      <hr />
      <br />
      {/* {testIndex} */}
      {/* {branches &&
        Object.entries(branches.branches).map(([branchName, branchInfo]) => (
          <div key={branchName}>
            <button type='button' onClick={() => checkoutBranch(branchName)}>
              {branchInfo.commit} - {branchName} {branchInfo.current ? '*' : ''}
            </button>
          </div>
        ))} */}

      <NavigableList
        items={list1}
        selectedIndex={testIndex}
        onItemClick={handleItemClick}
      />

      <br />
      <hr />
      <br />

      <NavigableList
        items={list2}
        selectedIndex={testIndex}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

export default Branches;
