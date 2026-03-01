import { createContext } from 'react';

import type { ZicktContextValue } from './types';

export const ZicktContext = createContext<ZicktContextValue | null>(null);
