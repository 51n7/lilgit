import { useEffect, useMemo, useState } from 'react';
import { RepoPathProp } from 'src/types';
import Menu from './Menu';

type RepoListProps = {
  onRepoSave: (item: RepoPathProp) => void;
  onRepoDelete: (item: number) => void;
  addRepo: () => void;
  list: RepoPathProp[];
};

function RepoList({ onRepoSave, onRepoDelete, addRepo, list }: RepoListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleItemClick = (item: number) => {
    setSelectedIndex(item);
  };

  const keyMap = useMemo(
    () => [
      {
        key: 'a',
        description: 'add',
        function: () => {
          addRepo();
          setShowMenu(false);
          console.log('a key was hit in repo view');
        },
      },
      {
        key: 'd',
        description: 'delete',
        function: () => {
          onRepoDelete(selectedIndex ?? 0);
          setShowMenu(false);
          setSelectedIndex(null);
          console.log('d key was hit in repo view');
        },
      },
      {
        key: 'escape',
        function: () => {
          setShowMenu(false);

          if (!showMenu) {
            setSelectedIndex(null);
          }
        },
      },
      {
        key: 'enter',
        function: () => {
          if (selectedIndex !== null && !showMenu) {
            onRepoSave(list[selectedIndex]);
          }
        },
      },
    ],
    [list, selectedIndex, onRepoSave, onRepoDelete, addRepo, showMenu],
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
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            return prevIndex === null || prevIndex === 0
              ? repoLength - 1
              : prevIndex - 1;
          });
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!showMenu) {
          setSelectedIndex((prevIndex) => {
            return prevIndex === null || prevIndex === repoLength - 1
              ? 0
              : prevIndex + 1;
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
  }, [keyMap, list, showMenu]);

  return (
    <div className='repo-container'>
      <div className='repo-list'>
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
      </div>
      <Menu options={keyMap} isOpen={showMenu} setIsOpen={setShowMenu} />
    </div>
  );
}

export default RepoList;
