import { useEffect, useMemo } from 'react';
import { GitLogEntry } from 'src/types';

export type GraphProps = {
  graph: GitLogEntry[] | undefined;
  removeCurrentRepo: () => void;
};

function Graph({ graph, removeCurrentRepo }: GraphProps) {
  const keyMap = useMemo(
    () => [
      {
        key: 'Escape',
        function: () => {
          removeCurrentRepo();
        },
      },
    ],
    [removeCurrentRepo],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const mappedFunction = keyMap.find((item) => item.key === event.key);

      if (mappedFunction) {
        mappedFunction.function();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap]);

  return (
    <div className='view-graph'>
      {graph &&
        graph.map((entry: GitLogEntry, index: number) => (
          <div key={index} className='line'>
            <div className='ellipsis'>
              <span>{entry.graph}</span>
              <span className='text-blue'>{entry.commit}</span>
              <span className='message'>{entry.message}</span>
            </div>
            <div>
              <span className='text-green'>{entry.name}</span>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Graph;
