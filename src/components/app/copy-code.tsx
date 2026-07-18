import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyCodeProps {
  code: string;
  className?: string;
}

/** A share code rendered as a click-to-copy chip. */
export function CopyCode({ code, className }: CopyCodeProps) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code.replace(/\s+/g, " ").trim());
      setCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — fail quietly.
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy share code"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-xs tabular-nums transition-colors hover:border-primary/50 hover:bg-secondary cursor-pointer",
        className,
      )}
    >
      <span>{code}</span>
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}
