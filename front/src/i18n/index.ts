import { en } from "./en";
import { ja } from "./ja";

export type Locale = "en" | "ja";
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["en", "ja"];

const translations: Record<Locale, typeof en> = { en, ja: ja as unknown as typeof en };

export function useTranslations(locale: Locale = "en") {
  return translations[locale];
}

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
