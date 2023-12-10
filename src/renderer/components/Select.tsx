import { useEffect, useState } from 'react';

type SelectProps = {
  title: string;
  options: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: (name: string) => void;
};

function Select({ title, options, isOpen, setIsOpen, onSelect }: SelectProps) {
  const [selectIndex, setSelectIndex] = useState<number>(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const menuLength = options.length;

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectIndex((prevIndex) => {
          return prevIndex === null || prevIndex === 0
            ? menuLength - 1
            : prevIndex - 1;
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectIndex((prevIndex) => {
          return prevIndex === null || prevIndex === menuLength - 1
            ? 0
            : prevIndex + 1;
        });
      } else if (event.key === 'Enter') {
        onSelect(options[selectIndex]);
        setIsOpen(false);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [options, selectIndex, isOpen, setIsOpen, onSelect]);

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>{title}</legend>

          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => setSelectIndex(index)}
              style={{
                backgroundColor:
                  selectIndex === index ? '#2f7351' : 'transparent',
              }}
            >
              {option}
            </div>
          ))}
        </fieldset>
      </nav>
    )
  );
}

export default Select;
