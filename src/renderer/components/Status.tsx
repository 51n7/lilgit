import { useEffect, useMemo } from 'react';
import { RepoProps } from 'src/types';

function Status({ currentRepo, branches }: RepoProps) {
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
      <header>
        <p>
          <em>Repo:</em> {currentRepo}
        </p>
        <p>
          <em>Branch:</em> On branch{' '}
          <span className='text-blue'>`{branches?.current}`</span>
        </p>
      </header>
    </div>
  );
}

export default Status;
