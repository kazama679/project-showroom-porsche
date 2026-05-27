'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AdminPageMeta {
  titleKey: string
  subtitleKey?: string
  actions?: ReactNode
}

interface AdminPageContextValue {
  meta: AdminPageMeta
  setMeta: (meta: AdminPageMeta) => void
  resetMeta: () => void
}

/* ------------------------------------------------------------------ */
/*  Route config fallback                                              */
/*  Pages that don't call useAdminPage() still get a title/subtitle    */
/*  based on the current pathname.                                     */
/* ------------------------------------------------------------------ */

const routeDefaults: Record<string, { titleKey: string; subtitleKey?: string }> = {
  '/admin': { titleKey: 'dashboard_title', subtitleKey: 'dashboard_subtitle' },
  '/admin/bookings': { titleKey: 'bookings_management', subtitleKey: 'bookings_subtitle' },
  '/admin/brands': { titleKey: 'brand_management', subtitleKey: 'brand_subtitle' },
  '/admin/series': { titleKey: 'series_management', subtitleKey: 'series_subtitle' },
  '/admin/models': { titleKey: 'model_management', subtitleKey: 'model_subtitle' },
  '/admin/cars': { titleKey: 'cars', subtitleKey: 'model_subtitle' },
  '/admin/options': { titleKey: 'options_management', subtitleKey: 'options_subtitle' },
  '/admin/option-groups': { titleKey: 'option_groups_management', subtitleKey: 'option_groups_subtitle' },
  '/admin/option-items': { titleKey: 'option_items_management', subtitleKey: 'option_items_subtitle' },
  '/admin/option-rules': { titleKey: 'option_rules_management', subtitleKey: 'option_rules_subtitle' },
  '/admin/car-model-options': { titleKey: 'car_model_options_management', subtitleKey: 'car_model_options_subtitle' },
  '/admin/media': { titleKey: 'media_management', subtitleKey: 'media_subtitle' },
  '/admin/body-types': { titleKey: 'body_design_management', subtitleKey: 'body_design_subtitle' },
  '/admin/banners': { titleKey: 'banners_management', subtitleKey: 'banners_subtitle' },
  '/admin/reviews': { titleKey: 'reviews_management', subtitleKey: 'reviews_subtitle' },
  '/admin/showrooms': { titleKey: 'showrooms_management', subtitleKey: 'showrooms_subtitle' },
  '/admin/test-drives': { titleKey: 'test_drives_management', subtitleKey: 'test_drives_subtitle' },
  '/admin/ai-logs': { titleKey: 'ai_logs_title', subtitleKey: 'ai_logs_subtitle' },
  '/admin/settings': { titleKey: 'settings_title', subtitleKey: 'settings_subtitle' },
  '/admin/users': { titleKey: 'manage_users', subtitleKey: 'users_subtitle' },
  '/admin/blog': { titleKey: 'blog_management', subtitleKey: 'blog_subtitle' },
  '/admin/language': { titleKey: 'language' },
  '/admin/vehicle-listings': { titleKey: 'vehicle_listings_title', subtitleKey: 'vehicle_listings_subtitle' },
}

function getRouteDefault(pathname: string): AdminPageMeta {
  // pathname from usePathname (next-intl) is already locale-stripped
  const match = routeDefaults[pathname]
  if (match) return { titleKey: match.titleKey, subtitleKey: match.subtitleKey }
  return { titleKey: 'portal' }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AdminPageStateContext = createContext<AdminPageMeta | null>(null)
const AdminPageSetterContext = createContext<{
  setMeta: (meta: AdminPageMeta) => void
  resetMeta: () => void
} | null>(null)

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AdminPageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [meta, setMetaState] = useState<AdminPageMeta>(() => getRouteDefault(pathname ?? '/admin'))

  // Reset metadata when the route changes so stale actions don't leak
  useEffect(() => {
    setMetaState(getRouteDefault(pathname ?? '/admin'))
  }, [pathname])

  const setMeta = useCallback((newMeta: AdminPageMeta) => {
    setMetaState(newMeta)
  }, [])

  const resetMeta = useCallback(() => {
    setMetaState(getRouteDefault(pathname ?? '/admin'))
  }, [pathname])

  const setterValue = useMemo(() => ({ setMeta, resetMeta }), [setMeta, resetMeta])

  return (
    <AdminPageSetterContext.Provider value={setterValue}>
      <AdminPageStateContext.Provider value={meta}>
        {children}
      </AdminPageStateContext.Provider>
    </AdminPageSetterContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  useAdminPage hook                                                  */
/*  Each page calls this to register its title/subtitle/actions.       */
/*  Cleans up on unmount to prevent metadata leaking between pages.    */
/* ------------------------------------------------------------------ */

export function useAdminPage(config: AdminPageMeta) {
  const ctx = useContext(AdminPageSetterContext)
  if (!ctx) {
    throw new Error('useAdminPage must be used within AdminPageProvider')
  }

  const { setMeta, resetMeta } = ctx
  const { titleKey, subtitleKey, actions } = config

  useEffect(() => {
    setMeta({ titleKey, subtitleKey, actions })
    // Cleanup on unmount — reset to route default
    return () => {
      resetMeta()
    }
    // We intentionally depend on titleKey/subtitleKey/actions.
    // actions is a ReactNode — callers should memoize with useMemo if it
    // contains state-dependent JSX to avoid infinite loops.
    // However, splitting the context prevents the infinite loop even if they don't!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleKey, subtitleKey, actions, setMeta, resetMeta])
}

/* ------------------------------------------------------------------ */
/*  AdminPageHeader                                                    */
/*  Rendered once by admin layout.tsx. Reads metadata from context     */
/*  and renders the page title bar with i18n.                          */
/* ------------------------------------------------------------------ */

export function AdminPageHeader() {
  const meta = useContext(AdminPageStateContext)
  const t = useTranslations('admin')

  if (!meta) return null

  const title = t(meta.titleKey)
  const subtitle = meta.subtitleKey ? t(meta.subtitleKey) : undefined

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-porsche-heading text-near-black dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-mid-gray dark:text-light-gray-surface mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {meta.actions && (
        <div className="flex gap-2 flex-wrap">{meta.actions}</div>
      )}
    </div>
  )
}
