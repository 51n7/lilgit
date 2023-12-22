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
  const [fileDiff, setFileDiff] = useState<diff.ParsedDiff | null>();
  const [count, setCount] = useState(0);
  const fileExtension = file?.path.split('.').pop();
  const hunkRefs = useRef<(React.RefObject<HTMLDivElement> | null)[]>([]);
  const hunkRef = useRef<HTMLDivElement>(null);
  const stringsToRemove = [`\\ No newline at end of file`];

  // reset hunks if navigating files up/down and file doesnt have the same hunk count
  useEffect(() => {
    if (!fileDiff?.hunks[count - 1]) {
      setCount(0);
    }
  }, [count, fileDiff?.hunks]);

  useEffect(() => {
    if (isOpen) {
      hljs.highlightAll();
    }
  }, [isOpen]);

  useEffect(() => {
    if (hunkRef.current) {
      const currentElement = hunkRef.current;

      if (currentElement && !currentElement.classList.contains('hljs')) {
        hljs.highlightElement(currentElement);
      }
    }
  }, [count]);

  useEffect(() => {
    if (file?.status === '?') {
      const untrackedItem = diff?.untracked.find(
        (item) => item.newFileName?.replace(/^b\//, '') === file?.path,
      );

      if (untrackedItem) {
        setFileDiff(untrackedItem);
      }
    } else {
      const trackedItem = diff?.tracked.find(
        (item) => item.oldFileName?.replace(/^a\//, '') === file?.path,
      );

      if (trackedItem) {
        setFileDiff(trackedItem);
      }
    }
  }, [diff?.tracked, diff?.untracked, file?.path, file?.status]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === ',') {
        event.preventDefault();
        if ((fileDiff?.hunks.length || 0) > 1) {
          setCount((prevCount) =>
            prevCount === 0 ? fileDiff?.hunks.length || 0 : prevCount - 1,
          );
        }
      } else if (event.key === '.') {
        event.preventDefault();
        if ((fileDiff?.hunks.length || 0) > 1) {
          setCount((prevCount) =>
            prevCount === fileDiff?.hunks.length ? 0 : prevCount + 1,
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
  }, [fileDiff, isOpen, setIsOpen]);

  return (
    isOpen && (
      <nav className='view-diff'>
        <fieldset className='menu'>
          <legend>
            {file?.path}
            {count !== 0 ? ` - ${count}/${fileDiff?.hunks.length}` : ''}
          </legend>

          {count === 0 &&
            fileDiff?.hunks.map((hunk, index) => {
              const concatenatedHTML = hunk.lines
                .filter(
                  (htmlString) => !stringsToRemove.includes(htmlString.trim()),
                )
                .map((htmlString) => htmlString.slice(1))
                .join('\n');

              const divRef =
                hunkRefs.current[index] ||
                (hunkRefs.current[index] = React.createRef<HTMLDivElement>());

              if (divRef.current) {
                const currentElement = hunkRefs.current[index]?.current;

                if (
                  currentElement &&
                  !currentElement.classList.contains('hljs')
                ) {
                  hljs.highlightElement(currentElement);
                }
              }

              return (
                <pre key={index}>
                  <code key={index} ref={divRef} className={fileExtension}>
                    {concatenatedHTML}
                  </code>
                  <div className='background-lines'>
                    {hunk.lines
                      .filter(
                        (htmlString) =>
                          !stringsToRemove.includes(htmlString.trim()),
                      )
                      .map((line, index) => {
                        let className = '';
                        const firstChar = line.charAt(0);

                        if (firstChar === '+') {
                          className = ' add';
                        } else if (firstChar === '-') {
                          className = ' remove';
                        } else if (!stringsToRemove.includes(line)) {
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

          {count !== 0 && fileDiff?.hunks[count - 1] && (
            <pre>
              <code key={count} ref={hunkRef} className={fileExtension}>
                {fileDiff?.hunks[count - 1].lines
                  .filter(
                    (htmlString) =>
                      !stringsToRemove.includes(htmlString.trim()),
                  )
                  .map((htmlString) => htmlString.slice(1))
                  .join('\n')}
              </code>

              <div className='background-lines'>
                {fileDiff?.hunks[count - 1].lines
                  .filter(
                    (htmlString) =>
                      !stringsToRemove.includes(htmlString.trim()),
                  )
                  .map((line, index) => {
                    let className = '';
                    const firstChar = line.charAt(0);

                    if (firstChar === '+') {
                      className = ' add';
                    } else if (firstChar === '-') {
                      className = ' remove';
                    } else if (!stringsToRemove.includes(line)) {
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
          )}
        </fieldset>
      </nav>
    )
  );
}

export default Diff;
