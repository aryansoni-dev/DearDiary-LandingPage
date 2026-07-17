import React from 'react';

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({ children, className = '', ...props }) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary-tint text-[#9E0F31] border border-brand-primary-soft/10 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
