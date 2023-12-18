import { useEffect } from 'react';
import { DiffResult, GitItem } from 'src/types';
import * as diff from 'diff';
import '$styles/diff.scss';

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
      <nav className='view-diff'>
        <fieldset className='menu'>
          <legend>{file?.path}</legend>

          {diffOutput?.hunks.map((hunk, index) => (
            <div key={index} className='hunk'>
              {diffOutput?.hunks && diffOutput?.hunks.length > 1 && (
                <div className='title'>Hunk {index + 1}:</div>
              )}
              <ul className='lines'>
                {hunk.lines.map((line, lineIndex) => {
                  let className = '';

                  if (line.charAt(0) === '+') {
                    className = ' add';
                  } else if (line.charAt(0) === '-') {
                    className = ' remove';
                  } else if (line === '\\ No newline at end of file') {
                    className = ' hide';
                  }

                  return (
                    <li key={lineIndex} className={`line${className}`}>
                      <span>{line.substring(1)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </fieldset>
      </nav>
    )
  );
}

export default Diff;
