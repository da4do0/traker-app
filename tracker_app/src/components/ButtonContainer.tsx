import React from 'react';

interface ButtonContainerProps {
  children: React.ReactNode;
  color: string;
  link?: string;
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({ children, color, link }) => {
  return (
    <a href={`/${link}`} className={`rounded-xl bg-${color}-200/10 border border-${color}-400/20 p-4 flex flex-col items-center justify-center min-h-[70px]`}>
      {children}
    </a>
  );
};

export default ButtonContainer;