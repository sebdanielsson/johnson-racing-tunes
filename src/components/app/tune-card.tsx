import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CopyCode } from "@/components/app/copy-code";
import { GameBadge } from "@/components/app/game-badge";
import { newSinceIds } from "@/data/seen";
import type { Tune } from "@/data/tunes";

export function TuneCard({ tune, onOpen }: { tune: Tune; onOpen: (tune: Tune) => void }) {
  const tags = tune.madeFor
    .split(/[\n/]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(tune)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(tune);
        }
      }}
      className="bg-card hover:border-primary/40 focus-visible:border-primary flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <GameBadge game={tune.game} />
        <Badge variant="outline" className="font-semibold">
          {tune.class}
        </Badge>
        {tune.isNew && <Badge className="h-4 px-1.5 text-[10px] leading-none">NEW</Badge>}
      </div>

      <div className="min-w-0">
        <h3 className="flex items-center gap-1.5 truncate font-semibold">
          {newSinceIds.has(tune.id) && (
            <span
              className="size-2 shrink-0 rounded-full bg-amber-400"
              title="New since your last visit"
              aria-label="New since your last visit"
            />
          )}
          <span className="truncate">{tune.car}</span>
        </h3>
        <p className="text-muted-foreground truncate text-xs">
          by {tune.creators.join(", ") || "unknown"}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {tune.shareCodes[0] ? (
          <CopyCode code={tune.shareCodes[0]} />
        ) : (
          <span className="text-muted-foreground text-xs">No code</span>
        )}
        {tune.videoUrl && (
          <a
            href={tune.videoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary-accent inline-flex items-center gap-1 text-xs hover:underline"
            title={tune.videoTitle || "Watch on YouTube"}
          >
            Video
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}
