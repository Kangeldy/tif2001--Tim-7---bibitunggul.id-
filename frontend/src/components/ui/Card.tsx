// ============================================================
// components/ui/Card.tsx – Card wrapper reusable
// ============================================================
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export default function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      {title && <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

