import { useEffect, useState } from 'react';

type KeyMapItem = {
  key: string;
  description?: string;
  function: () => void;
};

type MenuProps = {
  options: KeyMapItem[];
  onItemClick?: (item: string) => void;
  isOpen: boolean;
};

function Menu({ options, isOpen }: MenuProps) {
  const [menuIndex, setMenuIndex] = useState<number>(0);
  const objectsWithDescription = options.filter((item) => item.description);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const menuLength = objectsWithDescription.length;

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setMenuIndex((prevIndex) => {
          return prevIndex === null || prevIndex === 0
            ? menuLength - 1
            : prevIndex - 1;
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setMenuIndex((prevIndex) => {
          return prevIndex === null || prevIndex === menuLength - 1
            ? 0
            : prevIndex + 1;
        });
      } else if (event.key === 'Enter') {
        objectsWithDescription[menuIndex].function();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [objectsWithDescription, menuIndex, isOpen]);

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>Menu</legend>
          {objectsWithDescription.map((item, index) => (
            <div
              key={item.key}
              onClick={() => setMenuIndex(index)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  menuIndex === index ? '#2f7351' : 'transparent',
              }}
            >
              {item.key} {item.description}
            </div>
          ))}
        </fieldset>
      </nav>
    )
  );
}

export default Menu;
