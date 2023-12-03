import { useEffect, useRef, useState } from 'react';

type DialogProps = {
  title: string;
  defaultValue?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (name: string) => void;
};

function Dialog({
  title,
  defaultValue,
  isOpen,
  setIsOpen,
  onSubmit,
}: DialogProps) {
  const [dialogString, setDialogString] = useState<string>(defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onSubmit(dialogString || defaultValue || '');
      }

      if (event.key === 'Escape' || event.key === 'Enter') {
        setIsOpen(false);
        setDialogString('');
      }
    };

    setTimeout(() => {
      inputRef.current?.focus();
    }, 1);

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onSubmit, setIsOpen, dialogString, defaultValue]);

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>{title}</legend>
          <input
            type='text'
            ref={inputRef}
            defaultValue={defaultValue}
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
