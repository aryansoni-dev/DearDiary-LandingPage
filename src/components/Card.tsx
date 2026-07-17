import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(255,32,86,0.06)] border border-brand-primary-soft/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
