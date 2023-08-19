import { useEffect, useMemo, useState } from 'react';
import { RepoPathProp } from 'src/types';

type RepoListProps = {
  onRepoSave: (item: RepoPathProp) => void;
  onRepoDelete: (item: number) => void;
  list: RepoPathProp[];
};

function RepoList({ onRepoSave, onRepoDelete, list }: RepoListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleItemClick = (item: number) => {
    setSelectedIndex(item);
  };

  const keyMap = useMemo(
    () => [
      {
        key: 's',
        function: () => {
          console.log('s key was hit in repo view');
        },
      },
      {
        key: 'd',
        function: () => {
          onRepoDelete(selectedIndex ?? 0);
        },
      },
      {
        key: 'enter',
        function: () => {
          if (selectedIndex !== null) {
            onRepoSave(list[selectedIndex]);
          }
        },
      },
    ],
    [list, selectedIndex, onRepoSave, onRepoDelete],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const repoLength = list.length;
      const pressedKey = event.key.toLowerCase();
      const mappedFunction = keyMap.find((item) => item.key === pressedKey);
      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return repoLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === repoLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyMap, list]);

  return (
    <ul>
      {list &&
        list.map((item, index) => (
          <li key={item.short} id={`item-${index}`}>
            <span
              onClick={() => handleItemClick(index)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedIndex === index ? '#2f7351' : 'transparent',
              }}
            >
              {item.short}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default RepoList;
