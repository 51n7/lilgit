import { useEffect, useMemo } from 'react';
import { StatusResult } from 'simple-git';
// import { RepoProps } from 'src/types';

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
      const pressedKey = event.key.toLowerCase();
      const mappedFunction = keyMap.find((item) => item.key === pressedKey);

      if (mappedFunction) {
        mappedFunction.function();
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [keyMap]);

  return (
    <div className='view-status'>
      {transformStatus &&
        Object.keys(transformStatus).map((section) => (
          <div key={section}>
            <p className='text-red'>{section.toUpperCase()}:</p>
            <StatusList
              items={transformStatus[section]}
              selectedIndex={0}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}
    </div>
  );
}

export default Status;
