import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-500/20 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-forest-800 hover:bg-forest-700 text-white shadow-sm hover:shadow active:scale-[0.99] dark:bg-forest-700 dark:hover:bg-forest-600',
    secondary: 'bg-forest-100 hover:bg-forest-200 text-forest-800 font-semibold dark:bg-forest-800/40 dark:text-forest-200 dark:hover:bg-forest-800/60',
    outline: 'border border-forest-200/80 hover:bg-forest-50 text-forest-800 dark:border-white/10 dark:text-forest-200 dark:hover:bg-white/5',
    ghost: 'hover:bg-forest-100/50 text-forest-800 dark:text-forest-200 dark:hover:bg-white/5',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}
