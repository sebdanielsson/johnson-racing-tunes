import { Star } from "lucide-react";

import { favoritesStore, useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const favorites = useFavorites();
  const active = favorites.has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        favoritesStore.toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent cursor-pointer",
        className,
      )}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          active ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-foreground",
        )}
      />
    </button>
  );
}
