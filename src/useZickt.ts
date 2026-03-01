import { useContext } from 'react';

import { ZicktContext } from './context';
import type { ZicktContextValue } from './types';

export function useZickt(): ZicktContextValue {
  const context = useContext(ZicktContext);
  if (context === null) {
    throw new Error('useZickt must be used within a <ZicktProvider>');
  }
  return context;
}
