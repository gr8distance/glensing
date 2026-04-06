import { useState } from "react";
import { useTranslations, type Locale } from "../i18n";

export function InstallCommand({ name, locale = "en" }: { name: string; locale?: Locale }) {
  const [copied, setCopied] = useState(false);
  const cmd = `area51 add ${name}`;
  const t = useTranslations(locale);

  const copy = () => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className="install-cmd"
      role="button"
      tabIndex={0}
      onClick={copy}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copy(); } }}
      title={t.pkg.copyTooltip}
    >
      <code>$ {cmd}</code>
      <span className={`install-copy ${copied ? "copied" : ""}`}>
        {copied ? t.pkg.copied : t.pkg.copy}
      </span>
    </div>
  );
}
