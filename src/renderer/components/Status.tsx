import { useEffect, useMemo } from 'react';
import { RepoProps } from 'src/types';

function Status({ currentRepo }: RepoProps) {
  const keyMap = useMemo(
    () => [
      {
        key: 's',
        function: () => {
          console.log('s key was hit');
        },
      },
      {
        key: 'a',
        function: () => {
          console.log('a key was hit');
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
    <div>
      <h1>Status</h1>
      <p>Current Repo: {currentRepo}</p>
    </div>
  );
}

export default Status;
