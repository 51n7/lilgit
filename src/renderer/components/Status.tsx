import { useEffect, useMemo, useState } from 'react';
import { StatusResult } from 'simple-git';
import {
  convertGitResponse,
  findFileById,
} from '../../../src/helpers/status.helpers';
import StatusList from './StatusList';
import { GitItem } from 'src/types';
import Menu from './Menu';
import Dialog from './Dialog';

export type StatusProps = {
  status: StatusResult | undefined;
  onFileStage: (name: string) => void;
  onFileUnstage: (name: string) => void;
  onFileDiscard: (name: string) => void;
  onDiscard: () => void;
  stageAll: () => void;
  stageAllUntracked: () => void;
  unstageAll: () => void;
  commit: (message: string) => void;
  commitUnstaged: (message: string) => void;
  removeCurrentRepo: () => void;
};

function Status({
  status,
  onFileStage,
  onFileUnstage,
  onFileDiscard,
  onDiscard,
  stageAll,
  stageAllUntracked,
  unstageAll,
  commit,
  commitUnstaged,
  removeCurrentRepo,
}: StatusProps) {
  const transformStatus = convertGitResponse(status);
  const totalModified = Object.values(transformStatus).flat().length;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showCommitUnstagedDialog, setShowCommitUnstagedDialog] =
    useState<boolean>(false);
  const [showCommitDialog, setShowCommitDialog] = useState<boolean>(false);

  const handleItemClick = (item: GitItem) => {
    setSelectedIndex(item.id ?? 0);
  };

  // const handleCommitDialog = (item: string) => {
  //   console.log('commit: ', item);
  // };

  const keyMap = useMemo(
    () => [
      {
        key: 'o',
        description: 'open file',
        function: () => {
          console.log('open');
        },
      },
      {
        key: 's',
        description: 'stage file',
        function: () => {
          if (selectedIndex !== null) {
            onFileStage(
              findFileById(transformStatus, selectedIndex)?.path ?? '',
            );
          }
        },
      },
      {
        key: 'a',
        description: 'stage all unstaged files',
        function: stageAll,
      },
      {
        key: 'A',
        description: 'stage all unstaged and untracked files',
        function: stageAllUntracked,
      },
      {
        key: 'u',
        description: 'unstage file',
        function: () => {
          if (selectedIndex !== null) {
            onFileUnstage(
              findFileById(transformStatus, selectedIndex)?.path ?? '',
            );
          }
        },
      },
      {
        key: 'U',
        description: 'unstage all staged files',
        function: unstageAll,
      },
      {
        key: 'c',
        description: 'commit',
        function: () => {
          setShowCommitDialog((showCommit) => !showCommit);
        },
      },
      {
        key: 'C',
        description: 'commit, including unstaged',
        function: () => {
          setShowCommitUnstagedDialog(
            (showCommitUnstagedDialog) => !showCommitUnstagedDialog,
          );
        },
      },
      {
        key: 'd',
        description: 'discard changes to file',
        function: () => {
          if (selectedIndex !== null) {
            onFileDiscard(
              findFileById(transformStatus, selectedIndex)?.path ?? '',
            );
          }
        },
      },
      {
        key: 'D',
        description: 'discard all unstaged changes',
        function: onDiscard,
      },
      {
        key: 'Escape',
        function: () => {
          if (!showMenu) {
            setSelectedIndex(null);
            removeCurrentRepo();
          }
        },
      },
      {
        key: 'Enter',
        function: () => {
          if (selectedIndex !== null && !showMenu) {
            console.log(findFileById(transformStatus, selectedIndex));
          }
        },
      },
    ],
    [
      selectedIndex,
      onFileStage,
      transformStatus,
      onFileUnstage,
      onFileDiscard,
      onDiscard,
      stageAll,
      stageAllUntracked,
      unstageAll,
      showMenu,
      removeCurrentRepo,
    ],
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const listLength = totalModified;
      const mappedFunction = keyMap.find((item) => item.key === event.key);

      if (mappedFunction) {
        mappedFunction.function();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === 0) {
            return listLength - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prevIndex) => {
          if (prevIndex === null || prevIndex === listLength - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (event.shiftKey && event.code == 'Slash') {
        setShowMenu((showMenu) => !showMenu);
      }
    };

    if (!showMenu && !showCommitUnstagedDialog && !showCommitDialog) {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [
    keyMap,
    totalModified,
    transformStatus,
    selectedIndex,
    showMenu,
    showCommitDialog,
    showCommitUnstagedDialog,
  ]);

  return (
    <div className='view-status'>
      {transformStatus &&
        Object.keys(transformStatus).map((section) => (
          <div key={section}>
            <p className='text-red'>{section.toUpperCase()}:</p>
            <StatusList
              items={transformStatus[section]}
              selectedIndex={selectedIndex}
              onItemClick={handleItemClick}
            />
            <br />
          </div>
        ))}

      {Object.keys(transformStatus).length === 0 && (
        <div>Your working directory is clean.</div>
      )}

      <Menu options={keyMap} isOpen={showMenu} setIsOpen={setShowMenu} />
      <Dialog
        title='Commit Message'
        isOpen={showCommitDialog}
        setIsOpen={setShowCommitDialog}
        onSubmit={(message) => {
          commit(message);
        }}
      />
      <Dialog
        title='Commit Message'
        isOpen={showCommitUnstagedDialog}
        setIsOpen={setShowCommitUnstagedDialog}
        onSubmit={(message) => {
          commitUnstaged(message);
        }}
      />
    </div>
  );
}

export default Status;
