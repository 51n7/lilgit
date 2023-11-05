import React, { useState } from 'react';

function Output() {
  const [height, setHeight] = useState<number>(100);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const minHeight = 100;
    const maxHeight = window.innerHeight - window.innerHeight * (10 / 100); // viewport - 10%

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = height + startY - e.clientY;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={`resizable-box ${isResizing ? 'resizing' : ''}`}>
      <div className='resizable-handle' onMouseDown={startResize}>
        &nbsp;
      </div>
      <div className='content' style={{ height: `${height}px` }}>
        output message
      </div>
    </div>
  );
}

export default Output;
