import React, { useState, useEffect } from 'react';

interface ErrorNotificationProps {
  message: string;
  clearError: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  clearError,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modifiedErrorMessage = message.split(':').slice(1).join(':').trim();

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    const hideTimeout = setTimeout(() => {
      setIsVisible(false);

      setTimeout(() => {
        clearError();
      }, 250); // adjust this delay to match your transition duration (250ms in this case)
    }, 4500); // hide the notification after 4 seconds

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [clearError]);

  return (
    <div className={`error-notification ${isVisible ? 'show' : ''}`}>
      <p>{modifiedErrorMessage}</p>
    </div>
  );
};

export default ErrorNotification;
