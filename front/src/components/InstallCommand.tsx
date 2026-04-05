import { useState } from "react";

export function InstallCommand({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const cmd = `area51 add ${name}`;

  const copy = () => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="install-cmd" onClick={copy} title="Click to copy">
      <code>$ {cmd}</code>
      <span className={`install-copy ${copied ? "copied" : ""}`}>
        {copied ? "Copied!" : "Copy"}
      </span>
    </div>
  );
}
