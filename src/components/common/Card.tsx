import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  onClick?: () => void;
}

export const Card = ({ title, children, className, action, onClick }: CardProps) => {
  return (
    <div 
      className={clsx('bg-card border border-border rounded-xl shadow-sm', className)}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
