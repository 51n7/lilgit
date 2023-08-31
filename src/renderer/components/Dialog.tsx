import { useEffect } from 'react';

type DialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function Dialog({ isOpen, setIsOpen }: DialogProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('pressed escape in dialog');
        setIsOpen(false);
      }
      if (event.key === 'Enter') {
        console.log('pressed enter in dialog');
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, setIsOpen]);

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>New branch name (branch is off of 'main')</legend>
          <div>new-branch</div>
        </fieldset>
      </nav>
    )
  );
}

export default Dialog;
