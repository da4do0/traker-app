import React from "react";

interface ContainerProps {
  children?: React.ReactNode;
  css?: string;
  onClick?: () => void;
}

const Container: React.FC<ContainerProps> = ({ children, css, onClick }) => {
  return (
    <div
      className={`bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-800 ${css} ${
        onClick ? "cursor-pointer hover:border-gray-700 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Container;
