import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, rightElement, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-text-subtle pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-sm text-text-main shadow-xs transition-colors duration-150',
              'placeholder:text-text-subtle/70',
              'focus-visible:outline-none focus-visible:border-wine-600 focus-visible:ring-2 focus-visible:ring-wine-600/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              rightElement && 'pr-11',
              error && 'border-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger/20',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-text-subtle flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-status-danger">{error}</span>}
        {!error && helperText && <span className="text-xs text-text-subtle">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
