import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    let variantStyle = "";
    if (variant === 'primary') {
      variantStyle = "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] px-4 py-2 hover:scale-[1.02] shadow-sm hover:shadow-[0_0_15px_var(--color-accent-muted)]";
    } else if (variant === 'ghost') {
      variantStyle = "bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] px-4 py-2";
    } else if (variant === 'danger') {
      variantStyle = "bg-[var(--color-danger)] text-white hover:opacity-90 px-4 py-2";
    } else if (variant === 'icon') {
      variantStyle = "p-2 hover:bg-[var(--color-surface)] rounded-full text-[var(--color-text-primary)]";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyle} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
