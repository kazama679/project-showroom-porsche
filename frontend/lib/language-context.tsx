'use client';

import { useTranslations, useLocale } from 'next-intl';

/**
 * @deprecated 
 * This is a compatibility shim for migrating from the old flat translation system.
 * Do NOT use this in new components. 
 * Instead, use `useTranslations('namespace')` and `useLocale()` from next-intl directly.
 */
export function useLanguage() {
  const tAll = useTranslations();
  const locale = useLocale();

  return {
    language: locale as 'vi' | 'en',
    // Fallback wrapper for old flat keys like "admin.dashboard" or "common.save"
    t: (key: string) => tAll(key),
  };
}
