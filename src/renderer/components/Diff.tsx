import { useEffect } from 'react';
import { DiffResult, GitItem } from 'src/types';
import * as diff from 'diff';

type DiffProps = {
  diff?: DiffResult;
  file: GitItem | undefined;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function Diff({ diff, file, isOpen, setIsOpen }: DiffProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  let diffOutput: diff.ParsedDiff | null = null;

  if (file?.status === '?') {
    const untrackedItem = diff?.untracked.find(
      (item) => item.newFileName?.replace(/^b\//, '') === file?.path,
    );

    if (untrackedItem) {
      diffOutput = untrackedItem;
    }
  } else {
    const trackedItem = diff?.tracked.find(
      (item) => item.oldFileName?.replace(/^a\//, '') === file?.path,
    );

    if (trackedItem) {
      diffOutput = trackedItem;
    }
  }

  return (
    isOpen && (
      <nav>
        <fieldset className='menu'>
          <legend>{file?.path}</legend>

          {diffOutput?.hunks.map((hunk, index) => (
            <div key={index}>
              <div>
                <strong>Hunk {index + 1}:</strong>
              </div>
              <div>
                <strong>Lines:</strong>
                <ul>
                  {hunk.lines.map((line, lineIndex) => (
                    <li key={lineIndex}>{line}</li>
                  ))}
                </ul>
              </div>
              <br />
            </div>
          ))}
        </fieldset>
      </nav>
    )
  );
}

export default Diff;
