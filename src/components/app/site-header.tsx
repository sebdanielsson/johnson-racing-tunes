import { Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GithubIcon, YoutubeIcon } from "@/components/app/brand-icons";
import { Logo } from "@/components/app/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { CHANNEL_URL, SHEET_URL } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">
            Johnson Racing Tunes
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            The Forza community tune database
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Source spreadsheet"
          >
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Source spreadsheet"
            >
              <Table2 className="size-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild title="GitHub repository">
            <a
              href="https://github.com/sebdanielsson/johnson-racing-tunes"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            >
              <GithubIcon className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="ml-1 hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex"
          >
            <a href={CHANNEL_URL} target="_blank" rel="noreferrer">
              <YoutubeIcon className="size-4" />
              YouTube
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
