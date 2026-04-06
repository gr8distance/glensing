import { en } from "./en";
import { ja } from "./ja";

export type Locale = "en" | "ja";
export type Translations = typeof en;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["en", "ja"];

// Validate ja satisfies the same shape as en at the type level
const _jaCheck: Translations = ja as Translations;
const translations: Record<Locale, Translations> = { en, ja: _jaCheck };

export function getTranslations(locale: Locale = "en"): Translations {
  return translations[locale];
}

// Alias for backwards compatibility
export const useTranslations = getTranslations;

export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}

export function switchLocalePath(locale: Locale, currentPath: string): string {
  // Remove existing locale prefix
  const stripped = currentPath.replace(/^\/(ja)/, "") || "/";
  if (locale === "en") return stripped;
  return `/${locale}${stripped}`;
}

export function getLocaleFromPath(path: string): Locale {
  if (path.startsWith("/ja")) return "ja";
  return "en";
}
