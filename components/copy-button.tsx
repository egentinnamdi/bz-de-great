'use client';

import React from 'react';
import { CopyButton as UiCopyButton } from './ui/copy-button';

export function CopyButton({
  value,
  text,
  label,
  className,
  showIconOnly,
}: {
  value?: string;
  text?: string;
  label?: string;
  className?: string;
  showIconOnly?: boolean;
}) {
  return (
    <UiCopyButton
      value={value || text || ''}
      label={label}
      className={className}
      showIconOnly={showIconOnly}
    />
  );
}
