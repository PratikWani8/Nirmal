import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = false,
  padding = 'p-5 sm:p-6',
}) {
  return (
    <div className={`card-subtle rounded-2xl transition-all duration-200 ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between px-5 py-4 ${headerBorder ? 'border-b border-forest-100/60 dark:border-white/5' : ''}`}>
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#252D2A] dark:text-white flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-forest-700/60 dark:text-forest-200/60 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
}
