import { useEffect, useState } from 'react';
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
  const [diffTest, setDiffTest] = useState<diff.ParsedDiff | null>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [file]);

  useEffect(() => {
    if (file?.status === '?') {
      const untrackedItem = diff?.untracked.find(
        (item) => item.newFileName?.replace(/^b\//, '') === file?.path,
      );

      if (untrackedItem) {
        setDiffTest(untrackedItem);
      }
    } else {
      const trackedItem = diff?.tracked.find(
        (item) => item.oldFileName?.replace(/^a\//, '') === file?.path,
      );

      if (trackedItem) {
        setDiffTest(trackedItem);
      }
    }
  }, [diff?.tracked, diff?.untracked, file?.path, file?.status]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === ',') {
        event.preventDefault();
        if ((diffTest?.hunks.length || 0) > 1) {
          setCount((prevCount) =>
            prevCount === 0 ? diffTest?.hunks.length || 0 : prevCount - 1,
          );
        }
      } else if (event.key === '.') {
        event.preventDefault();
        if ((diffTest?.hunks.length || 0) > 1) {
          setCount((prevCount) =>
            prevCount === diffTest?.hunks.length ? 0 : prevCount + 1,
          );
        }
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
  }, [diffTest, isOpen, setIsOpen, file]);

  return (
    isOpen && (
      <nav className='view-diff'>
        <fieldset className='menu'>
          <legend>
            {file?.path}
            {count !== 0 ? ` - ${count}/${diffTest?.hunks.length}` : ''}
          </legend>

          {count === 0 &&
            diffTest?.hunks.map((hunk, index) => (
              <div key={index} className='hunk'>
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

          {count !== 0 && (
            <div key={count} className='hunk'>
              <ul className='lines'>
                {diffTest?.hunks[count - 1].lines.map((line, lineIndex) => {
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
          )}
        </fieldset>
      </nav>
    )
  );
}

export default Diff;
