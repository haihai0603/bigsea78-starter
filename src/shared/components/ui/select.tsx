'use client';

import * as React from 'react';

/* ------------------------------------------------------------------ */
/*  Select – minimal shadcn-style wrapper over native <select>        */
/* ------------------------------------------------------------------ */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value);
      onChange?.(e);
    };
    return <select ref={ref} onChange={handleChange} {...props} />;
  },
);
Select.displayName = 'Select';

export { Select };

/* thin wrappers so imports from @/shared/components/ui/select work verbatim */

export function SelectTrigger({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return <div {...props}>{children}</div>;
}

export function SelectContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return <div {...props}>{children}</div>;
}

export function SelectItem({ children, value, ...props }: React.OptionHTMLAttributes<HTMLOptionElement> & { children?: React.ReactNode }) {
  return <option value={value} {...props}>{children}</option>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <>{placeholder ?? 'Select…'}</>;
}
