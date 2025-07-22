import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  css?: string;
}

const Container: React.FC<ContainerProps> = ({ children, css}) => {
  return (
    <div
      className={`bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800 ${css}`}
    >
      {children}
    </div>
  );
};

export default Container;
