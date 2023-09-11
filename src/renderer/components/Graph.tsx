import { useEffect, useMemo, useState } from 'react';
import { GitLogEntry } from 'src/types';

export type GraphProps = {
  graph: GitLogEntry[] | undefined;
  removeCurrentRepo: () => void;
};

function Graph({ graph, removeCurrentRepo }: GraphProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    console.log('Selected item:', index);
    setSelectedIndex(index);
  };

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
      const graphLength = graph?.length || 0;
      const mappedFunction = keyMap.find((item) => item.key === event.key);

      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return graphLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === graphLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.shiftKey && event.code == 'Slash') {
        // setShowMenu((showMenu) => !showMenu);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [graph, keyMap]);

  return (
    <div className='view-graph'>
      {graph &&
        graph.map((entry: GitLogEntry, index: number) => (
          <div
            key={index}
            className='line'
            style={{
              cursor: 'pointer',
              backgroundColor: selectedIndex === index ? '#2f7351' : '',
            }}
            onClick={() => handleItemClick(index)}
          >
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
