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
        key: 's',
        description: 'stash changes',
        function: () => {
          console.log('s key was hit in status view');
        },
      },
      {
        key: 'a',
        description: 'add file',
        function: () => {
          console.log('a key was hit in status view');
        },
      },
      {
        key: 'escape',
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
        key: 'enter',
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
      <Menu options={keyMap} isOpen={showMenu} />
    </div>
  );
}

export default Status;
