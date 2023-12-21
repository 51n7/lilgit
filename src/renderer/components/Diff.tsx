import { useEffect, useRef, useState } from 'react';
import { DiffResult, GitItem } from 'src/types';
import * as diff from 'diff';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark-dimmed.min.css';
import '$styles/diff.scss';
import React from 'react';

type DiffProps = {
  diff?: DiffResult;
  file: GitItem | undefined;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function Diff({ diff, file, isOpen, setIsOpen }: DiffProps) {
  const [diffTest, setDiffTest] = useState<diff.ParsedDiff | null>();
  const [count, setCount] = useState(0);
  const fileExtension = file?.path.split('.').pop();
  const divRefs = useRef<(React.RefObject<HTMLDivElement> | null)[]>([]);

  // reset hunks if navigating up/down and sibling doesnt have the same count
  useEffect(() => {
    if (!diffTest?.hunks[count - 1]) {
      setCount(0);
    }
  }, [count, diffTest?.hunks]);

  useEffect(() => {
    if (isOpen) {
      hljs.highlightAll();
    }
  }, [isOpen]);

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
  }, [diffTest, isOpen, setIsOpen]);

  // console.log(diffTest?.hunks[0].lines.join('\n'));

  return (
    isOpen && (
      <nav className='view-diff'>
        <fieldset className='menu'>
          <legend>
            {file?.path}
            {count !== 0 ? ` - ${count}/${diffTest?.hunks.length}` : ''}
          </legend>

          {count === 0 &&
            diffTest?.hunks.map((hunk, index) => {
              const stringsToRemove = ['\\ No newline at end of file'];
              const concatenatedHTML = hunk.lines
                .filter(
                  (htmlString) => !stringsToRemove.includes(htmlString.trim()),
                )
                .map((htmlString) => htmlString.slice(1))
                .join('\n');

              const divRef =
                divRefs.current[index] ||
                (divRefs.current[index] = React.createRef<HTMLDivElement>());

              if (divRef.current) {
                const currentElement = divRefs.current[index]?.current;

                if (
                  currentElement &&
                  !currentElement.classList.contains('hljs')
                ) {
                  hljs.highlightElement(currentElement);
                }
              }

              const diffLines = hunk.lines
                .filter(
                  (htmlString) => !stringsToRemove.includes(htmlString.trim()),
                )
                .map((line) => line.charAt(0));

              return (
                <pre key={index}>
                  <code key={index} ref={divRef} className={fileExtension}>
                    {concatenatedHTML}
                  </code>
                  <div className='background-lines'>
                    {diffLines.map((char, index) => {
                      let className = '';

                      if (char === '+') {
                        className = ' add';
                      } else if (char === '-') {
                        className = ' remove';
                      } else if (char === '\\ No newline at end of file') {
                        className = ' hide';
                      }

                      return (
                        <span key={index} className={`line${className}`}>
                          &nbsp;
                        </span>
                      );
                    })}
                  </div>
                </pre>
              );
            })}

          {/* {count !== 0 && diffTest?.hunks[count - 1] && (
            <pre>
              <code className={fileExtension}>
                {diffTest?.hunks[count - 1].lines.join('\n')}
              </code>
            </pre>
          )} */}

          {/* {count === 0 &&
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
            ))} */}

          {count !== 0 && diffTest?.hunks[count - 1] && (
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
