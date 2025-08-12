import React, { createContext, useContext } from 'react';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

const LanguageContext = createContext<ReturnType<typeof useLanguagePreference> | null>(null);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const value = useLanguagePreference();
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
