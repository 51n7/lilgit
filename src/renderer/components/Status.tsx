import { useEffect, useMemo, useState } from 'react';
import { StatusResult } from 'simple-git';

import { convertGitResponse } from '../../../src/helpers/status.helpers';
import StatusList from './StatusList';
import { GitItem } from 'src/types';

export type StatusProps = {
  status: StatusResult | undefined;
};

const handleItemClick = (item: GitItem) => {
  console.log('Selected item:', item.path);
};

function Status({ status }: StatusProps) {
  const transformStatus = convertGitResponse(status);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const totalModified = Object.values(transformStatus).flat().length;

  const keyMap = useMemo(
    () => [
      {
        key: 's',
        function: () => {
          console.log('s key was hit in status view');
        },
      },
      {
        key: 'a',
        function: () => {
          console.log('a key was hit in status view');
        },
      },
    ],
    [],
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
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return listLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === listLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        console.log('Enter');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap, totalModified]);

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
    </div>
  );
}

export default Status;
