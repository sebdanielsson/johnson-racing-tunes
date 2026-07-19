import { ExternalLink, Info } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CopyCode } from "@/components/app/copy-code";
import { FavoriteButton } from "@/components/app/favorite-button";
import { GameBadge } from "@/components/app/game-badge";
import { YoutubeIcon } from "@/components/app/brand-icons";
import type { Tune } from "@/data/tunes";

export function TuneDetail({
  tune,
  onOpenChange,
}: {
  tune: Tune | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!tune} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {tune && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <GameBadge game={tune.game} />
                <Badge variant="outline" className="font-semibold">
                  {tune.class}
                </Badge>
                {tune.isNew && <Badge className="text-[10px]">NEW</Badge>}
                <FavoriteButton id={tune.id} className="ml-auto" />
              </div>
              <DialogTitle className="mt-1 text-xl">{tune.car}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {tune.madeFor && (
                <Field label="Made for">
                  <div className="flex flex-wrap gap-1">
                    {tune.madeFor
                      .split(/[\n/]/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </Field>
              )}

              <Field label={tune.creators.length > 1 ? "Creators" : "Creator"}>
                <span className="text-sm">{tune.creators.join(", ") || "—"}</span>
              </Field>

              <Field label={tune.shareCodes.length > 1 ? "Share codes" : "Share code"}>
                {tune.shareCodes.length ? (
                  <div className="flex flex-wrap gap-2">
                    {tune.shareCodes.map((c) => (
                      <CopyCode key={c} code={c} />
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No share code listed</span>
                )}
              </Field>

              {tune.info && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <span>{tune.info}</span>
                </div>
              )}

              {tune.videoUrl && (
                <a
                  href={tune.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:border-primary/50 hover:bg-accent flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors"
                >
                  <YoutubeIcon className="text-primary size-5" />
                  <span className="flex-1">{tune.videoTitle || "Watch on YouTube"}</span>
                  <ExternalLink className="text-muted-foreground size-4" />
                </a>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
