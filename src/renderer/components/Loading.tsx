type LoadingProps = {
  message: string;
  isOpen: boolean;
};

function Loading({ message, isOpen }: LoadingProps) {
  return (
    isOpen && (
      <nav>
        <div className='loading'>{message}</div>
      </nav>
    )
  );
}

export default Loading;
