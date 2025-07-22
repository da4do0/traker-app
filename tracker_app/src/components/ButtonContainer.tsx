import React from 'react';

interface ButtonContainerProps {
  children: React.ReactNode;
  color?: 'emerald' | 'yellow' | 'blue' | 'purple' | 'red' | 'green' | 'orange' | 'indigo' | 'pink' | 'gray';
  link?: string;
}

const colorMap: Record<string, string> = {
  emerald: '#10B981', // Tailwind emerald-500
  yellow: '#EAB308',  // Tailwind yellow-500
  blue: '#3B82F6',    // Tailwind blue-500
  purple: '#A855F7',  // Tailwind purple-500
  red: '#EF4444',     // Tailwind red-500
  green: '#22C55E',   // Tailwind green-500
  orange: '#F59E42',  // Tailwind orange-500
  indigo: '#6366F1',  // Tailwind indigo-500
  pink: '#EC4899',    // Tailwind pink-500
  gray: '#6B7280',    // Tailwind gray-500
};

const ButtonContainer: React.FC<ButtonContainerProps> = ({ children, color = 'CCCCCC', link = '' }) => {
  const hex = colorMap[color] || '#CCCCCC';

  return (
    <a
      href={`/${link}`}
      className="rounded-xl border p-4 flex flex-col items-center justify-center min-h-[70px]"
      style={{
        backgroundColor: hex + '1A', // circa 10% di opacità
        borderColor: hex + '66',     // circa 40% di opacità
      }}
    >
      {children}
    </a>
  );
};

export default ButtonContainer;
