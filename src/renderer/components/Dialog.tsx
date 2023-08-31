import { useEffect, useRef, useState } from 'react';

type DialogProps = {
  title: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (item: string) => void;
};

function Dialog({ title, isOpen, setIsOpen, onSubmit }: DialogProps) {
  const [dialogString, setDialogString] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      if (event.key === 'Enter') {
        setIsOpen(false);
        onSubmit(dialogString);
      }
      inputRef.current?.focus();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onSubmit, setIsOpen, dialogString]);

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>{title}</legend>
          <input
            type='text'
            ref={inputRef}
            defaultValue=''
            onChange={(e) => {
              setDialogString(e.currentTarget.value);
            }}
          />
        </fieldset>
      </nav>
    )
  );
}

export default Dialog;
