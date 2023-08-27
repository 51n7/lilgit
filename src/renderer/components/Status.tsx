import { useEffect, useMemo, useState } from 'react';
import { StatusResult } from 'simple-git';
import {
  convertGitResponse,
  findFileById,
} from '../../../src/helpers/status.helpers';
import StatusList from './StatusList';
import { GitItem } from 'src/types';
import Menu from './Menu';

export type StatusProps = {
  status: StatusResult | undefined;
  removeCurrentRepo: () => void;
};

function Status({ status, removeCurrentRepo }: StatusProps) {
  const transformStatus = convertGitResponse(status);
  const totalModified = Object.values(transformStatus).flat().length;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleItemClick = (item: GitItem) => {
    setSelectedIndex(item.id ?? 0);
  };

  const keyMap = useMemo(
    () => [
      {
        key: 'o',
        description: 'open file',
        function: () => {
          console.log('open');
        },
      },
      {
        key: 's',
        description: 'stage file',
        function: () => {
          console.log('stage file');
        },
      },
      {
        key: 'u',
        description: 'unstage file',
        function: () => {
          console.log('unstage file');
        },
      },
      {
        key: 'd',
        description: 'discard changes to file',
        function: () => {
          console.log('discard changes to file');
        },
      },
      {
        key: 'a',
        description: 'stage all unstaged files',
        function: () => {
          console.log('stage all unstaged files');
        },
      },
      {
        key: 'A',
        description: 'stage all unstaged and untracked files',
        function: () => {
          console.log('stage all unstaged and untracked files');
        },
      },
      {
        key: 'U',
        description: 'unstage all staged files',
        function: () => {
          console.log('unstage all staged files');
        },
      },
      {
        key: 'D',
        description: 'discard all unstaged changes',
        function: () => {
          console.log('discard all unstaged changes');
        },
      },
      {
        key: 'c',
        description: 'commit',
        function: () => {
          console.log('commit');
        },
      },
      {
        key: 'C',
        description: 'commit, including unstaged',
        function: () => {
          console.log('commit, including unstaged');
        },
      },
      {
        key: 'Escape',
        function: () => {
          setShowMenu(false);

          if (!showMenu) {
            setSelectedIndex(null);
            removeCurrentRepo();
            console.log('remove repo');
          }
        },
      },
      {
        key: 'Enter',
        function: () => {
          if (selectedIndex !== null && !showMenu) {
            console.log(findFileById(transformStatus, selectedIndex));
          }
        },
      },
    ],
    [showMenu, removeCurrentRepo, selectedIndex, transformStatus],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const listLength = totalModified;
      const mappedFunction = keyMap.find((item) => item.key === event.key);

      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            if (prevIndex === null || prevIndex === 0) {
              return listLength - 1;
            } else {
              return prevIndex - 1;
            }
          });
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            if (prevIndex === null || prevIndex === listLength - 1) {
              return 0;
            } else {
              return prevIndex + 1;
            }
          });
        }
      } else if (event.shiftKey && event.code == 'Slash') {
        setShowMenu((showMenu) => !showMenu);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap, totalModified, transformStatus, selectedIndex, showMenu]);

  return (
    <div className='view-status'>
      {transformStatus &&
        Object.keys(transformStatus).map((section) => (
          <div key={section}>
            <p className='text-red'>{section.toUpperCase()}:</p>
            <StatusList
              items={transformStatus[section]}
              selectedIndex={selectedIndex}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}

      {Object.keys(transformStatus).length === 0 && (
        <div>Your working directory is clean.</div>
      )}

      <Menu options={keyMap} isOpen={showMenu} />
    </div>
  );
}

export default Status;
