// ============================================================
// components/ui/Button.tsx – Tombol reusable
// ============================================================
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-green-700 text-white hover:bg-green-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger:    'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg text-sm font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}
      `}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

