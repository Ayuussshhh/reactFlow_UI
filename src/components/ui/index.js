/**
 * Base UI Components with Liquid Glass Design System
 * Inspired by Apple's design language and Figma's collaborative feel
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// ==================== Glass Panel ====================
export const GlassPanel = forwardRef(({ className, variant = 'default', blur = 'md', ...props }, ref) => {
  const variants = {
    default: 'bg-white/80 border-white/60',
    frosted: 'bg-white/60 border-white/40',
    dark: 'bg-neutral-900/80 border-neutral-700/60 text-white',
    primary: 'bg-primary-500/10 border-primary-300/40',
  };

  const blurLevels = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border shadow-lg',
        blurLevels[blur],
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
GlassPanel.displayName = 'GlassPanel';

// ==================== Button ====================
export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  children,
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg',
    secondary: 'bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300',
    ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// ==================== Input ====================
export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">{label}</label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl',
          'text-sm text-neutral-900 placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400',
          'transition-all duration-200',
          error && 'border-red-400 focus:ring-red-400/50 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

// ==================== Select ====================
export const Select = forwardRef(({ className, label, options = [], ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl',
          'text-sm text-neutral-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400',
          'transition-all duration-200 cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});
Select.displayName = 'Select';

// ==================== Badge ====================
export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ==================== Tabs ====================
export const Tabs = ({ value, onChange, tabs, className }) => {
  return (
    <div className={cn('flex p-1 bg-neutral-100/80 backdrop-blur-sm rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            value === tab.value
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ==================== Card ====================
export const Card = forwardRef(({ className, hover = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

// ==================== IconButton ====================
export const IconButton = forwardRef(({ className, variant = 'ghost', ...props }, ref) => {
  const variants = {
    ghost: 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/80',
    primary: 'text-primary-500 hover:text-primary-600 hover:bg-primary-50',
    danger: 'text-red-500 hover:text-red-600 hover:bg-red-50',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
IconButton.displayName = 'IconButton';

// ==================== Tooltip ====================
export const Tooltip = ({ children, content, side = 'top' }) => {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          'absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg shadow-lg',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap',
          side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
          side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
          side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
          side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'
        )}
      >
        {content}
      </div>
    </div>
  );
};

// ==================== Spinner ====================
export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <svg
      className={cn('animate-spin text-primary-500', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// ==================== Empty State ====================
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
};
